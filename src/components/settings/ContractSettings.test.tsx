import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContractSettings from "./ContractSettings";
import {
  DeleteContract,
  SetContractArchived,
} from "@/modules/contracts/actions";
import type { ManagedContract } from "@/modules/contracts/queries";
import type { Category } from "@/modules/categories/model";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/reglages",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/modules/contracts/actions", () => ({
  DeleteContract: vi.fn(),
  SetContractArchived: vi.fn(),
  CreateSubscription: vi.fn(),
  EditSubscription: vi.fn(),
}));

vi.mock("@/components/icons/FullIconSearchSelector", () => ({
  default: () => null,
}));

const categories: Category[] = [
  { id: "1", slug: "abonnement", label: "Abonnement", color: "#f472b6", position: 0 },
  { id: "2", slug: "energie", label: "Énergie", color: "#fbbf24", position: 1 },
];

const base: ManagedContract = {
  id: "c1",
  name: "Netflix Famille",
  provider: "Netflix",
  contractNumber: null,
  category: "abonnement",
  amount: 20,
  frequency: "monthly",
  debitDay: 15,
  anchorMonth: null,
  startDate: null,
  renewalDate: null,
  status: "active",
  createdAt: new Date(2026, 0, 1).toISOString(),
};

const make = (over: Partial<ManagedContract>): ManagedContract => ({
  ...base,
  ...over,
});

const edf = make({
  id: "c2",
  name: "EDF Électricité",
  provider: "EDF",
  category: "energie",
  amount: 65,
});
const archived = make({
  id: "c3",
  name: "Ancien forfait",
  provider: "Orange",
  amount: 12,
  status: "archived",
});

function renderSettings(contracts: ManagedContract[]) {
  return render(
    <ContractSettings contracts={contracts} categories={categories} />,
  );
}

describe("ContractSettings – liste", () => {
  beforeEach(() => {
    vi.mocked(DeleteContract).mockReset();
    vi.mocked(SetContractArchived).mockReset();
  });

  it("affiche les contrats actifs avec leur catégorie et leur montant", () => {
    renderSettings([base, edf]);

    expect(screen.getByText("Netflix Famille")).toBeInTheDocument();
    expect(screen.getByText("EDF Électricité")).toBeInTheDocument();
    expect(screen.getByText("20 €")).toBeInTheDocument();
    expect(screen.getByText(/Netflix · Abonnement · Mensuel/)).toBeInTheDocument();
  });

  it("masque les contrats archivés par défaut et les retrouve par le filtre", async () => {
    const user = userEvent.setup();
    renderSettings([base, archived]);

    expect(screen.queryByText("Ancien forfait")).not.toBeInTheDocument();
    // Un contrat archivé ne doit pas disparaître sans explication.
    expect(screen.getByText(/1 contrat archivé/)).toBeInTheDocument();

    await user.click(screen.getByLabelText("Statut"));
    await user.click(screen.getByRole("option", { name: /Archivés/ }));

    expect(screen.getByText("Ancien forfait")).toBeInTheDocument();
    expect(screen.queryByText("Netflix Famille")).not.toBeInTheDocument();
  });

  it("filtre sur le nom comme sur le fournisseur", async () => {
    const user = userEvent.setup();
    renderSettings([base, edf]);

    await user.type(
      screen.getByPlaceholderText(/Rechercher un contrat/),
      "edf",
    );

    expect(screen.getByText("EDF Électricité")).toBeInTheDocument();
    expect(screen.queryByText("Netflix Famille")).not.toBeInTheDocument();
  });

  // Trois contrats dont l'ordre d'ENTRÉE, l'ordre par MONTANT et l'ordre par
  // NOM diffèrent tous. Sans ça, un tri neutralisé passerait les tests :
  // vérifié par mutation.
  const zenith = make({ id: "z", name: "Zénith Assurance", provider: "Zénith", amount: 100 });
  const alpha = make({ id: "a", name: "Alpha Mobile", provider: "Alpha", amount: 300 });
  const milieu = make({ id: "m", name: "Milieu Énergie", provider: "Milieu", amount: 50 });
  const entree = [zenith, alpha, milieu]; // ordre d'entrée volontairement quelconque
  const titres = () =>
    screen
      .getAllByTitle(/Zénith Assurance|Alpha Mobile|Milieu Énergie/)
      .map((n) => n.textContent);

  it("trie par montant décroissant par défaut", () => {
    renderSettings(entree);
    expect(titres()).toEqual([
      "Alpha Mobile", // 300
      "Zénith Assurance", // 100
      "Milieu Énergie", // 50
    ]);
  });

  it("reclasse alphabétiquement quand on trie par nom", async () => {
    const user = userEvent.setup();
    renderSettings(entree);

    await user.click(screen.getByLabelText("Trier par"));
    await user.click(screen.getByRole("option", { name: "Nom" }));

    expect(titres()).toEqual([
      "Alpha Mobile",
      "Milieu Énergie",
      "Zénith Assurance",
    ]);
  });
});

describe("ContractSettings – actions", () => {
  beforeEach(() => {
    vi.mocked(DeleteContract).mockReset();
    vi.mocked(SetContractArchived).mockReset();
  });

  it("archive un contrat actif", async () => {
    const user = userEvent.setup();
    vi.mocked(SetContractArchived).mockResolvedValue({ success: true });
    renderSettings([base]);

    await user.click(screen.getByRole("button", { name: "Archiver" }));

    expect(SetContractArchived).toHaveBeenCalledWith("c1", true);
  });

  it("restaure un contrat archivé", async () => {
    const user = userEvent.setup();
    vi.mocked(SetContractArchived).mockResolvedValue({ success: true });
    renderSettings([archived]);

    await user.click(screen.getByLabelText("Statut"));
    await user.click(screen.getByRole("option", { name: /Archivés/ }));
    await user.click(screen.getByRole("button", { name: "Restaurer" }));

    expect(SetContractArchived).toHaveBeenCalledWith("c3", false);
  });

  it("demande confirmation avant de supprimer et propose d'archiver", async () => {
    const user = userEvent.setup();
    renderSettings([base]);

    await user.click(screen.getByRole("button", { name: "Supprimer" }));

    expect(screen.getByText(/Supprimer «/)).toBeInTheDocument();
    expect(screen.getByText(/La suppression est définitive/)).toBeInTheDocument();
    // Une porte de sortie moins radicale pour un contrat encore actif.
    expect(
      screen.getByRole("button", { name: "Archiver à la place" }),
    ).toBeInTheDocument();
    expect(DeleteContract).not.toHaveBeenCalled();
  });

  it("ne supprime qu'après confirmation explicite", async () => {
    const user = userEvent.setup();
    vi.mocked(DeleteContract).mockResolvedValue({ success: true });
    renderSettings([base]);

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(
      screen.getByRole("button", { name: "Supprimer définitivement" }),
    );

    expect(DeleteContract).toHaveBeenCalledWith("c1");
  });

  it("referme la confirmation sur Annuler sans rien supprimer", async () => {
    const user = userEvent.setup();
    renderSettings([base]);

    await user.click(screen.getByRole("button", { name: "Supprimer" }));
    await user.click(screen.getByRole("button", { name: "Annuler" }));

    expect(screen.queryByText(/La suppression est définitive/)).not.toBeInTheDocument();
    expect(DeleteContract).not.toHaveBeenCalled();
  });

  it("affiche l'erreur renvoyée par l'action", async () => {
    const user = userEvent.setup();
    vi.mocked(SetContractArchived).mockResolvedValue({
      error: "Contrat non trouvé.",
    });
    renderSettings([base]);

    await user.click(screen.getByRole("button", { name: "Archiver" }));

    expect(await screen.findByText("Contrat non trouvé.")).toBeInTheDocument();
  });

  it("ouvre la popup d'édition sur Modifier", async () => {
    const user = userEvent.setup();
    renderSettings([base]);

    await user.click(screen.getByRole("button", { name: "Modifier" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Modifier le contrat")).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue("Netflix Famille")).toBeInTheDocument();
  });
});

describe("ContractSettings – états vides", () => {
  it("distingue l'absence de contrat de l'absence de résultat", async () => {
    const user = userEvent.setup();
    const { unmount } = renderSettings([]);
    expect(screen.getByText("Aucun contrat")).toBeInTheDocument();
    unmount();

    renderSettings([base]);
    await user.type(
      screen.getByPlaceholderText(/Rechercher un contrat/),
      "introuvable",
    );
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });
});
