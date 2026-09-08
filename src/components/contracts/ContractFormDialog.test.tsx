import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContractFormDialog from "./ContractFormDialog";
import { CreateSubscription, EditSubscription } from "@/modules/contracts/actions";
import type { CalendarContract } from "@/modules/contracts/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/modules/contracts/actions", () => ({
  EditSubscription: vi.fn(),
  CreateSubscription: vi.fn(),
}));

// Le vrai sélecteur importe tout `@mui/icons-material` (des milliers de
// modules) : hors de propos ici et coûteux à transformer dans les tests.
vi.mock("@/components/icons/FullIconSearchSelector", () => ({
  default: () => null,
}));

const contract: CalendarContract = {
  id: "contract-1",
  name: "Netflix",
  provider: "Netflix",
  contractNumber: "REF-123",
  category: "abonnement",
  amount: 15.99,
  frequency: "monthly",
  debitDay: 12,
  anchorMonth: null,
  startDate: null,
  renewalDate: "2027-01-15T00:00:00.000Z",
  documentUrl: "/uploads/user/existing.pdf",
  documentName: "contrat-netflix.pdf",
  iconType: "brand",
  iconValue: "netflix",
};

describe("ContractFormDialog – mode édition", () => {
  beforeEach(() => {
    vi.mocked(EditSubscription).mockReset();
  });

  it("hydrate les champs à partir du contrat quand la popup s'ouvre", () => {
    render(
      <ContractFormDialog open mode="edit" contract={contract} onClose={() => {}} />,
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Modifier le contrat")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("Netflix")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("15.99")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("REF-123")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("2027-01-15")).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Document actuel : contrat-netflix\.pdf/),
    ).toBeInTheDocument();
  });

  it("hydrate le jour de prélèvement du mois (fréquence mensuelle)", () => {
    render(
      <ContractFormDialog open mode="edit" contract={contract} onClose={() => {}} />,
    );
    // Le jour 12 doit être sélectionné dans la mini-grille 1-31
    const day12 = screen.getByText("12", { selector: "div" });
    expect(day12).toHaveStyle({ color: "#fff" });
  });

  it("hydrate la date unique de prélèvement pour un contrat 'once'", () => {
    const onceContract: CalendarContract = {
      ...contract,
      frequency: "once",
      startDate: "2026-11-05T00:00:00.000Z",
    };

    render(
      <ContractFormDialog open mode="edit" contract={onceContract} onClose={() => {}} />,
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByDisplayValue("2026-11-05")).toBeInTheDocument();
  });

  it("appelle EditSubscription avec l'id du contrat puis ferme la popup en cas de succès", async () => {
    vi.mocked(EditSubscription).mockResolvedValue({ success: true });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ContractFormDialog open mode="edit" contract={contract} onClose={onClose} />,
    );

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => {
      expect(EditSubscription).toHaveBeenCalledTimes(1);
    });

    const [calledId, calledFormData] = vi.mocked(EditSubscription).mock
      .calls[0];
    expect(calledId).toBe("contract-1");
    expect(calledFormData.get("name")).toBe("Netflix");
    expect(calledFormData.get("category")).toBe("abonnement");
    expect(calledFormData.get("debitDay")).toBe("12");

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("affiche l'erreur renvoyée par EditSubscription sans fermer la popup", async () => {
    vi.mocked(EditSubscription).mockResolvedValue({
      error: "Le montant doit être positif",
    });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ContractFormDialog open mode="edit" contract={contract} onClose={onClose} />,
    );

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(
      await screen.findByText("Le montant doit être positif"),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ContractFormDialog – mode création", () => {
  beforeEach(() => {
    vi.mocked(CreateSubscription).mockReset();
  });

  it("s'ouvre avec des champs vides", () => {
    render(<ContractFormDialog open mode="create" onClose={() => {}} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Ajouter un contrat")).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/Fournisseur \/ nom du contrat/),
    ).toHaveValue("");
  });

  it("appelle CreateSubscription (jamais EditSubscription) et ferme la popup en cas de succès", async () => {
    vi.mocked(CreateSubscription).mockResolvedValue({ success: true });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ContractFormDialog open mode="create" onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/Fournisseur \/ nom du contrat/),
      "Spotify",
    );
    await user.click(within(dialog).getByText("Internet & mobile"));
    await user.type(within(dialog).getByLabelText(/Montant/), "9,99");
    await user.click(within(dialog).getByText("15"));

    await user.click(within(dialog).getByRole("button", { name: /ajouter au calendrier/i }));

    await waitFor(() => {
      expect(CreateSubscription).toHaveBeenCalledTimes(1);
    });
    expect(EditSubscription).not.toHaveBeenCalled();

    const [calledFormData] = vi.mocked(CreateSubscription).mock.calls[0];
    expect(calledFormData.get("name")).toBe("Spotify");
    expect(calledFormData.get("category")).toBe("telecom");
    expect(calledFormData.get("debitDay")).toBe("15");

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("ne pré-remplit rien depuis un contrat précédemment édité (ré-ouverture en création)", () => {
    const { rerender } = render(
      <ContractFormDialog open mode="edit" contract={contract} onClose={() => {}} />,
    );
    expect(screen.getByDisplayValue("Netflix")).toBeInTheDocument();

    rerender(<ContractFormDialog open mode="create" onClose={() => {}} />);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByDisplayValue("Netflix")).not.toBeInTheDocument();
    expect(
      within(dialog).getByLabelText(/Fournisseur \/ nom du contrat/),
    ).toHaveValue("");
  });
});
