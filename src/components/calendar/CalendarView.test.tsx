import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarView from "./CalendarView";
import { CreateSubscription, EditSubscription } from "@/modules/contracts/actions";
import type { CalendarContract } from "@/modules/contracts/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/modules/contracts/actions", () => ({
  EditSubscription: vi.fn(),
  CreateSubscription: vi.fn(),
}));

// Ces composants importent tout `@mui/icons-material` (des milliers de
// modules) : hors de propos ici et coûteux à transformer dans les tests.
vi.mock("@/components/icons/FullIconSearchSelector", () => ({
  default: () => null,
}));
vi.mock("@components/icons/ContratInlineIcon", () => ({
  default: () => null,
}));

const today = new Date();

function makeContract(overrides: Partial<CalendarContract> = {}): CalendarContract {
  return {
    id: "contract-1",
    name: "Netflix",
    provider: "Netflix",
    contractNumber: "REF-123",
    category: "abonnement",
    amount: 15.99,
    frequency: "monthly",
    debitDay: today.getDate(),
    anchorMonth: null,
    startDate: null,
    renewalDate: null,
    documentUrl: null,
    documentName: null,
    iconType: "brand",
    iconValue: "netflix",
    ...overrides,
  };
}

describe("CalendarView – édition d'un contrat depuis 'Contrats du jour'", () => {
  it("affiche un bouton Éditer sur chaque fiche de la colonne du jour", async () => {
    const user = userEvent.setup();
    const contract = makeContract();

    render(
      <CalendarView
        contracts={[contract]}
        stats={{ activeContracts: 1, totalContracts: 1, totalAnnual: 191.88 }}
      />,
    );

    await user.click(screen.getByTestId(`calendar-day-${today.getDate()}`));

    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /éditer le contrat/i }),
    ).toBeInTheDocument();
  });

  it("ouvre la popup pré-remplie avec les données du contrat au clic sur Éditer", async () => {
    const user = userEvent.setup();
    const contract = makeContract();

    render(
      <CalendarView
        contracts={[contract]}
        stats={{ activeContracts: 1, totalContracts: 1, totalAnnual: 191.88 }}
      />,
    );

    await user.click(screen.getByTestId(`calendar-day-${today.getDate()}`));
    await user.click(screen.getByRole("button", { name: /éditer le contrat/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Modifier le contrat")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("Netflix")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("15.99")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("REF-123")).toBeInTheDocument();
  });

  it("enregistre la modification via EditSubscription et referme la popup", async () => {
    vi.mocked(EditSubscription).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    const contract = makeContract();

    render(
      <CalendarView
        contracts={[contract]}
        stats={{ activeContracts: 1, totalContracts: 1, totalAnnual: 191.88 }}
      />,
    );

    await user.click(screen.getByTestId(`calendar-day-${today.getDate()}`));
    await user.click(screen.getByRole("button", { name: /éditer le contrat/i }));

    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /enregistrer/i }));

    expect(EditSubscription).toHaveBeenCalledWith("contract-1", expect.any(FormData));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("CalendarView – création d'un contrat via la popup", () => {
  it("ouvre la popup de création (champs vides) au clic sur 'Ajouter un contrat'", async () => {
    const user = userEvent.setup();

    render(<CalendarView contracts={[]} stats={{ activeContracts: 0, totalContracts: 0 }} />);

    await user.click(screen.getByRole("button", { name: "Ajouter un contrat" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Ajouter un contrat")).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/Fournisseur \/ nom du contrat/),
    ).toHaveValue("");
  });

  it("appelle CreateSubscription (jamais EditSubscription) à la création", async () => {
    vi.mocked(CreateSubscription).mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<CalendarView contracts={[]} stats={{ activeContracts: 0, totalContracts: 0 }} />);

    await user.click(screen.getByRole("button", { name: "Ajouter un contrat" }));
    const dialog = await screen.findByRole("dialog");

    await user.type(
      within(dialog).getByLabelText(/Fournisseur \/ nom du contrat/),
      "Spotify",
    );
    await user.click(within(dialog).getByText("Internet & mobile"));
    await user.type(within(dialog).getByLabelText(/Montant/), "9,99");
    await user.click(within(dialog).getByText("15"));

    await user.click(
      within(dialog).getByRole("button", { name: /ajouter au calendrier/i }),
    );

    await waitFor(() => {
      expect(CreateSubscription).toHaveBeenCalledTimes(1);
    });
    expect(EditSubscription).not.toHaveBeenCalled();
  });
});
