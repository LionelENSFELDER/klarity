import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContractFormDialog from "./ContractFormDialog";
import { anchorHelp } from "./ContractFormFields";
import { CreateSubscription, EditSubscription } from "@/modules/contracts/actions";
import { CreateCategory } from "@/modules/categories/actions";
import type { CalendarContract } from "@/modules/contracts/calendar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/modules/contracts/actions", () => ({
  EditSubscription: vi.fn(),
  CreateSubscription: vi.fn(),
}));

vi.mock("@/modules/categories/actions", () => ({
  CreateCategory: vi.fn(async () => ({ success: true })),
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
  });

  it("hydrate le jour de prélèvement du mois (fréquence mensuelle)", () => {
    render(
      <ContractFormDialog open mode="edit" contract={contract} onClose={() => {}} />,
    );
    // Le jour 12 doit être sélectionné dans la mini-grille 1-31
    const days = screen.getByRole("group", { name: /Jour du prélèvement/ });
    expect(within(days).getByRole("button", { name: "12" })).toHaveAttribute("aria-pressed", "true");
    expect(within(days).getByRole("button", { name: "11" })).toHaveAttribute("aria-pressed", "false");
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
      within(dialog).getByLabelText(/^Nom du contrat/),
    ).toHaveValue("");
  });

  it("appelle CreateSubscription (jamais EditSubscription) et ferme la popup en cas de succès", async () => {
    vi.mocked(CreateSubscription).mockResolvedValue({ success: true });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ContractFormDialog open mode="create" onClose={onClose} />);

    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText(/^Nom du contrat/),
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
      within(dialog).getByLabelText(/^Nom du contrat/),
    ).toHaveValue("");
  });
});

describe("ContractFormDialog – aperçu et catégories", () => {
  it("montre les prochains prélèvements du contrat en cours de saisie", async () => {
    const user = userEvent.setup();
    render(<ContractFormDialog open mode="create" onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    const apercu = within(dialog).getByRole("complementary", { name: "Aperçu" });

    expect(within(apercu).getByText(/Choisissez un jour/)).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/Montant/), "9,99");
    await user.click(within(dialog).getByRole("button", { name: "15" }));

    expect(within(apercu).queryByText(/Choisissez un jour/)).not.toBeInTheDocument();
    // Trois prochaines dates, chacune au montant saisi, plus le lissé.
    expect(within(apercu).getAllByText("9,99 €").length).toBeGreaterThanOrEqual(4);
    expect(within(apercu).getByText("119,88 €")).toBeInTheDocument();
  });

  it("crée une catégorie depuis le formulaire et l'enregistre avec le contrat", async () => {
    vi.mocked(CreateSubscription).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ContractFormDialog open mode="create" onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "+ Nouvelle" }));
    await user.type(within(dialog).getByLabelText("Nom de la nouvelle catégorie"), "Sport");
    await user.click(within(dialog).getByRole("button", { name: "Créer" }));
    expect(CreateCategory).toHaveBeenCalledWith("Sport");

    await user.type(within(dialog).getByLabelText(/^Nom du contrat/), "Basic-Fit");
    await user.type(within(dialog).getByLabelText(/Montant/), "29,99");
    await user.click(within(dialog).getByRole("button", { name: "27" }));
    await user.click(within(dialog).getByRole("button", { name: /ajouter au calendrier/i }));

    // Le slug est calculé comme le ferait le serveur, sans attendre le rechargement.
    await waitFor(() => expect(CreateSubscription).toHaveBeenCalled());
    const [formData] = vi.mocked(CreateSubscription).mock.calls.at(-1)!;
    expect(formData.get("category")).toBe("sport");
  });
});

describe("ContractFormDialog – contrat annuel", () => {
  it("annonce les prélèvements au mois du contrat, pas au mois en cours", () => {
    const annual: CalendarContract = {
      ...contract,
      frequency: "annual",
      anchorMonth: 0,
      debitDay: 3,
    };
    render(<ContractFormDialog open mode="edit" contract={annual} onClose={() => {}} />);

    const apercu = within(screen.getByRole("dialog")).getByRole("complementary", { name: "Aperçu" });
    // Avant correction, l'ancre retombait sur le mois en cours.
    const dates = within(apercu).getAllByText(/ 3 /);
    expect(dates.length).toBeGreaterThan(0);
    for (const d of dates) expect(d).toHaveTextContent(/3 janvier/);
  });
});

describe("ContractFormDialog – mois de référence", () => {
  beforeEach(() => {
    vi.mocked(CreateSubscription).mockReset();
    vi.mocked(EditSubscription).mockReset();
  });

  it("n'apparaît que pour un trimestriel ou un annuel", async () => {
    const user = userEvent.setup();
    render(<ContractFormDialog open mode="create" onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");

    expect(within(dialog).queryByLabelText("Mois du prélèvement")).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Annuel" }));
    expect(within(dialog).getByLabelText("Mois du prélèvement")).toBeInTheDocument();
  });

  it("envoie le mois choisi à la création", async () => {
    vi.mocked(CreateSubscription).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ContractFormDialog open mode="create" onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");

    await user.type(within(dialog).getByLabelText(/^Nom du contrat/), "Assurance auto");
    await user.click(within(dialog).getByText("Assurance auto", { selector: "button" }));
    await user.type(within(dialog).getByLabelText(/Montant/), "412");
    await user.click(within(dialog).getByRole("button", { name: "Annuel" }));
    await user.click(within(dialog).getByRole("button", { name: "3" }));
    await user.click(within(dialog).getByLabelText("Mois du prélèvement"));
    await user.click(await screen.findByRole("option", { name: "Mars" }));

    expect(within(dialog).getByText("Prélevé chaque année en mars.")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /ajouter au calendrier/i }));

    await waitFor(() => expect(CreateSubscription).toHaveBeenCalled());
    const [formData] = vi.mocked(CreateSubscription).mock.calls[0];
    expect(formData.get("frequency")).toBe("annual");
    expect(formData.get("anchorMonth")).toBe("2");
  });

  it("renvoie le mois du contrat modifié tel quel", async () => {
    vi.mocked(EditSubscription).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    const annual: CalendarContract = { ...contract, frequency: "annual", anchorMonth: 0, debitDay: 3 };
    render(<ContractFormDialog open mode="edit" contract={annual} onClose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => expect(EditSubscription).toHaveBeenCalled());
    const [, formData] = vi.mocked(EditSubscription).mock.calls[0];
    expect(formData.get("anchorMonth")).toBe("0");
  });

  it("n'envoie pas de mois pour un contrat mensuel", async () => {
    vi.mocked(EditSubscription).mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<ContractFormDialog open mode="edit" contract={contract} onClose={() => {}} />);

    await user.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() => expect(EditSubscription).toHaveBeenCalled());
    const [, formData] = vi.mocked(EditSubscription).mock.calls[0];
    expect(formData.get("anchorMonth")).toBeNull();
  });
});

describe("anchorHelp", () => {
  it("dit en clair quand tombe le prélèvement", () => {
    expect(anchorHelp("annual", 0)).toBe("Prélevé chaque année en janvier.");
    // Trimestriel ancré en novembre : les quatre mois, dans l'ordre de l'année.
    expect(anchorHelp("quarterly", 10)).toBe("Prélevé en février, mai, août et novembre.");
  });

  it("explique le champ tant qu'aucun mois n'est choisi", () => {
    expect(anchorHelp("annual", null)).toMatch(/^Le mois où tombe un prélèvement/);
  });
});
