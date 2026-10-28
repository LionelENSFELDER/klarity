import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EcheancesView, { type EcheancesSummary } from "./EcheancesView";
import type { EcheancesParams } from "./params";
import type { CalendarContract } from "@/modules/contracts/calendar";
import type { Category } from "@/modules/categories/model";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/modules/contracts/actions", () => ({
  EditSubscription: vi.fn(),
  CreateSubscription: vi.fn(),
  SetContractArchived: vi.fn(),
  DeleteContract: vi.fn(),
}));

// Le vrai sélecteur importe tout `@mui/icons-material` : hors sujet ici.
vi.mock("@/components/icons/FullIconSearchSelector", () => ({
  default: () => null,
}));

const categories: Category[] = [
  { id: "1", slug: "abonnement", label: "Abonnement", color: "#f472b6", position: 0 },
  { id: "2", slug: "energie", label: "Énergie", color: "#fbbf24", position: 1 },
];

const base: CalendarContract = {
  id: "c1",
  name: "Netflix Famille",
  provider: "Netflix",
  contractNumber: null,
  category: "abonnement",
  amount: 20,
  frequency: "monthly",
  debitDay: 25,
  anchorMonth: null,
  startDate: null,
  renewalDate: null,
};

const make = (over: Partial<CalendarContract>): CalendarContract => ({
  ...base,
  ...over,
});

const TODAY_ISO = new Date(2026, 9, 18).toISOString();

const params: EcheancesParams = {
  liste: "a-venir",
  categorie: null,
  fournisseur: null,
  vue: "liste",
  horizon: 3,
};

// Résumé neutre : ses montants ne doivent pas se confondre avec ceux testés.
const summary: EcheancesSummary = {
  remainingThisMonth: 0,
  remainingCount: 0,
  nextMonthTotal: 0,
  smoothedMonthly: 0,
  contractCount: 0,
  renewalsSoon: 0,
  next: null,
  renewals: [],
  categories: [],
};

function renderView(
  contracts: CalendarContract[],
  over: Partial<EcheancesParams> = {},
  totalContracts = contracts.length,
) {
  return render(
    <EcheancesView
      contracts={contracts}
      totalContracts={totalContracts}
      categories={categories}
      params={{ ...params, ...over }}
      summary={summary}
      todayISO={TODAY_ISO}
    />,
  );
}

describe("EcheancesView – liste des échéances", () => {
  it("groupe les occurrences par mois avec le total du mois", () => {
    renderView([make({ amount: 20, debitDay: 25 })]);

    expect(screen.getByText("octobre 2026")).toBeInTheDocument();
    expect(screen.getByText("novembre 2026")).toBeInTheDocument();
    // Un seul contrat à 20 € : chaque mois totalise 20 €.
    expect(screen.getAllByText("20 €").length).toBeGreaterThanOrEqual(2);
  });

  it("regroupe les prélèvements d'un même jour sous un intercalaire daté", () => {
    renderView([
      make({ id: "a", name: "Netflix", amount: 20, debitDay: 25 }),
      make({ id: "b", name: "Spotify", amount: 15.5, debitDay: 25 }),
    ], { horizon: 3 });

    // Un intercalaire par jour, pas par contrat.
    expect(screen.getAllByText("Dimanche 25 octobre")).toHaveLength(1);
    expect(screen.getByText("Dans 7 jours")).toBeInTheDocument();
    expect(screen.getAllByText("35,50 €").length).toBeGreaterThanOrEqual(1);
  });

  it("répète un contrat mensuel à chaque mois de l'horizon", () => {
    renderView([make({ debitDay: 25 })]);
    expect(screen.getAllByText("Netflix Famille")).toHaveLength(3);
    // Le fournisseur apparaît en ligne secondaire de chaque occurrence.
    expect(screen.getAllByText("Netflix")).toHaveLength(3);
  });

  it("affiche le total de la période dans l'en-tête", () => {
    renderView([make({ amount: 10, debitDay: 25 })]);
    expect(screen.getByText("sur la période")).toBeInTheDocument();
    expect(screen.getByText("30 €")).toBeInTheDocument();
  });

  it("ouvre la fiche au clic sur une ligne, puis l'édition depuis la fiche", async () => {
    const user = userEvent.setup();
    renderView([make({ debitDay: 25 })]);

    await user.click(screen.getAllByText("Netflix Famille")[0]);
    const fiche = await screen.findByRole("dialog");
    expect(within(fiche).getByRole("heading", { name: "Netflix Famille" })).toBeInTheDocument();

    await user.click(within(fiche).getByRole("button", { name: "Modifier" }));
    const dialog = await screen.findByRole("dialog", { name: /Modifier le contrat/ });
    expect(within(dialog).getByDisplayValue("Netflix Famille")).toBeInTheDocument();
    // Le fournisseur, distinct du nom, est hydraté dans son propre champ.
    expect(within(dialog).getByDisplayValue("Netflix")).toBeInTheDocument();
  });
});

describe("EcheancesView – états vides", () => {
  it("distingue l'absence de contrat de l'absence d'échéance", () => {
    renderView([], {}, 0);
    expect(screen.getByText("Bienvenue sur Klarity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ajouter mon premier contrat/ })).toBeInTheDocument();
  });

  it("annonce la prochaine échéance quand l'horizon est trop court", () => {
    // Contrat annuel ancré en mars : rien sur 3 mois à partir d'octobre.
    renderView([make({ frequency: "annual", anchorMonth: 2, debitDay: 20 })]);

    expect(screen.getByText("Rien sur les 3 prochains mois")).toBeInTheDocument();
    expect(screen.getByText(/tombe en mars 2027/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Élargir à 12 mois/ })).toBeInTheDocument();
  });

  it("signale un filtre de catégorie sans contrat", () => {
    renderView([], { categorie: "energie" }, 4);
    expect(screen.getByText(/Aucun contrat dans/)).toBeInTheDocument();
  });
});

describe("EcheancesView – vue calendrier", () => {
  const calendrier = { vue: "calendrier" as const };

  it("affiche la grille du mois", () => {
    renderView([make({ debitDay: 25 })], calendrier);
    expect(screen.getByTestId("calendar-day-25")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-day-1")).toBeInTheDocument();
  });

  it("porte le total du jour dans la case", () => {
    renderView(
      [
        make({ id: "a", amount: 20, debitDay: 25 }),
        make({ id: "b", amount: 15.5, debitDay: 25 }),
      ],
      calendrier,
    );

    expect(screen.getByTestId("calendar-day-25")).toHaveTextContent("35,50 €");
  });

  it("n'affiche aucun montant sur un jour sans prélèvement", () => {
    renderView([make({ debitDay: 25 })], calendrier);
    expect(screen.getByTestId("calendar-day-24")).toHaveTextContent(/^24$/);
  });

  it("détaille d'office le prochain jour prélevé dans le panneau", () => {
    renderView(
      [
        make({ id: "a", name: "Netflix", amount: 20, debitDay: 25 }),
        make({ id: "b", name: "Spotify", amount: 15.5, debitDay: 25 }),
        make({ id: "c", name: "EDF", amount: 80, debitDay: 5 }),
      ],
      calendrier,
    );

    // Le 5 est passé (aujourd'hui : 18 octobre) : le panneau s'ouvre sur le 25.
    const panel = screen.getByRole("complementary", { name: "Détail du jour" });
    expect(within(panel).getByText("25 octobre")).toBeInTheDocument();
    expect(within(panel).getByText("Netflix")).toBeInTheDocument();
    expect(within(panel).getByText("15,50 €")).toBeInTheDocument();
    expect(within(panel).getByText("35,50 €")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("change de jour au clic, sans réagir sur un jour vide", async () => {
    const user = userEvent.setup();
    renderView(
      [
        make({ id: "a", name: "Netflix", debitDay: 25 }),
        make({ id: "c", name: "EDF", amount: 80, debitDay: 5 }),
      ],
      calendrier,
    );
    const panel = screen.getByRole("complementary", { name: "Détail du jour" });

    await user.click(screen.getByTestId("calendar-day-24"));
    expect(within(panel).getByText("25 octobre")).toBeInTheDocument();

    await user.click(screen.getByTestId("calendar-day-5"));
    expect(within(panel).getByText("5 octobre")).toBeInTheDocument();
    expect(within(panel).getByText("EDF")).toBeInTheDocument();
  });

  it("ouvre la fiche du contrat depuis une ligne du panneau", async () => {
    const user = userEvent.setup();
    renderView([make({ name: "Netflix Famille", debitDay: 25 })], calendrier);

    const panel = screen.getByRole("complementary", { name: "Détail du jour" });
    await user.click(within(panel).getByText("Netflix Famille"));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Netflix Famille" })).toBeInTheDocument();
  });
});
