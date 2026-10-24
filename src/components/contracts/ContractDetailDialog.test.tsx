import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContractDetailDialog from "./ContractDetailDialog";
import { DeleteContract, SetContractArchived } from "@/modules/contracts/actions";
import type { CalendarContract } from "@/modules/contracts/calendar";
import type { Category } from "@/modules/categories/model";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/modules/contracts/actions", () => ({
  SetContractArchived: vi.fn(async () => ({ success: true })),
  DeleteContract: vi.fn(async () => ({ success: true })),
}));

const categories: Category[] = [
  { id: "1", slug: "auto", label: "Assurance auto", color: "#60a5fa", position: 0 },
];

const contract: CalendarContract = {
  id: "z1",
  name: "Assurance auto",
  provider: "Zénith",
  contractNumber: "ZA-118734",
  category: "auto",
  amount: 412,
  frequency: "annual",
  debitDay: 3,
  anchorMonth: 0,
  startDate: null,
  renewalDate: "2027-01-03T00:00:00.000Z",
};

const TODAY = new Date(2026, 9, 24);

function renderDetail(onEdit = vi.fn(), onClose = vi.fn()) {
  render(
    <ContractDetailDialog
      contract={contract}
      categories={categories}
      today={TODAY}
      onClose={onClose}
      onEdit={onEdit}
    />,
  );
  return { onEdit, onClose, dialog: screen.getByRole("dialog") };
}

describe("ContractDetailDialog", () => {
  it("montre le coût, son équivalent mensuel et le prochain prélèvement", () => {
    const { dialog } = renderDetail();
    expect(within(dialog).getByText("Zénith")).toBeInTheDocument();
    expect(within(dialog).getByText(/≈ 34,33 € par mois lissé/)).toBeInTheDocument();
    expect(within(dialog).getByText("dans 71 jours")).toBeInTheDocument();
    expect(within(dialog).getByText("ZA-118734")).toBeInTheDocument();
    expect(within(dialog).getByText("Annuel, le 3 janvier")).toBeInTheDocument();
  });

  it("nomme les quatre mois d'un trimestriel", () => {
    render(
      <ContractDetailDialog
        contract={{ ...contract, frequency: "quarterly", anchorMonth: 10, debitDay: 1 }}
        categories={categories}
        today={TODAY}
        onClose={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Trimestriel, le 1er en février, mai, août et novembre"),
    ).toBeInTheDocument();
  });

  it("passe la main au formulaire pour modifier", async () => {
    const { dialog, onEdit, onClose } = renderDetail();
    await userEvent.click(within(dialog).getByRole("button", { name: "Modifier" }));
    expect(onClose).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalledWith(contract);
  });

  it("archive en un clic", async () => {
    const { dialog } = renderDetail();
    await userEvent.click(within(dialog).getByRole("button", { name: "Archiver" }));
    expect(SetContractArchived).toHaveBeenCalledWith("z1", true);
  });

  it("demande confirmation avant de supprimer", async () => {
    const { dialog } = renderDetail();
    await userEvent.click(within(dialog).getByRole("button", { name: "Supprimer définitivement" }));
    expect(DeleteContract).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole("button", { name: "Supprimer définitivement" }));
    expect(DeleteContract).toHaveBeenCalledWith("z1");
  });
});
