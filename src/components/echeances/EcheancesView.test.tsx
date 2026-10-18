import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EcheancesView from "./EcheancesView";
import type { EcheancesParams } from "./params";
import type { CalendarContract } from "@/modules/contracts/calendar";
import type { Category } from "@/modules/categories/model";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/modules/contracts/actions", () => ({
  EditSubscription: vi.fn(),
  CreateSubscription: vi.fn(),
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
  famille: null,
  fournisseur: null,
  vue: "liste",
  horizon: 3,
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

  it("ouvre la popup d'édition au clic sur une ligne", async () => {
    const user = userEvent.setup();
    renderView([make({ debitDay: 25 })]);

    await user.click(screen.getAllByText("Netflix Famille")[0]);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Modifier le contrat")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("Netflix Famille")).toBeInTheDocument();
    // Le fournisseur, distinct du nom, est hydraté dans son propre champ.
    expect(within(dialog).getByDisplayValue("Netflix")).toBeInTheDocument();
  });
});

describe("EcheancesView – états vides", () => {
  it("distingue l'absence de contrat de l'absence d'échéance", () => {
    renderView([], {}, 0);
    expect(screen.getByText("Aucun contrat")).toBeInTheDocument();
  });

  it("annonce la prochaine échéance quand l'horizon est trop court", () => {
    // Contrat annuel ancré en mars : rien sur 3 mois à partir d'octobre.
    renderView([make({ frequency: "annual", anchorMonth: 2, debitDay: 20 })]);

    expect(screen.getByText("Rien sur les 3 prochains mois")).toBeInTheDocument();
    expect(screen.getByText(/tombe en mars 2027/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Élargir à 12 mois/ })).toBeInTheDocument();
  });

  it("signale un filtre de famille sans contrat", () => {
    renderView([], { famille: "energie" }, 4);
    expect(screen.getByText(/Aucun contrat dans/)).toBeInTheDocument();
  });
});

describe("EcheancesView – vue calendrier", () => {
  it("affiche la grille du mois quand la vue est calendrier", () => {
    renderView([make({ debitDay: 25 })], { vue: "calendrier" });
    expect(screen.getByTestId("calendar-day-25")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-day-1")).toBeInTheDocument();
  });
});
