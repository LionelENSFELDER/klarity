import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountSettings from "./AccountSettings";
import { DeleteAccount } from "@/modules/account/actions";

vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("@/modules/account/actions", () => ({ DeleteAccount: vi.fn() }));

describe("AccountSettings", () => {
  it("n'active la suppression qu'une fois l'e-mail retapé", async () => {
    const user = userEvent.setup();
    render(<AccountSettings email="jean@example.com" />);

    await user.click(screen.getByRole("button", { name: "Supprimer mon compte" }));
    const confirm = screen.getByRole("button", { name: "Supprimer définitivement" });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText(/Retape ton e-mail/), "Jean@Example.com");
    expect(confirm).toBeEnabled();
  });

  it("affiche l'erreur renvoyée par le serveur", async () => {
    const user = userEvent.setup();
    vi.mocked(DeleteAccount).mockResolvedValue({ error: "Compte introuvable." });
    render(<AccountSettings email="jean@example.com" />);

    await user.click(screen.getByRole("button", { name: "Supprimer mon compte" }));
    await user.type(screen.getByLabelText(/Retape ton e-mail/), "jean@example.com");
    await user.click(screen.getByRole("button", { name: "Supprimer définitivement" }));

    expect(await screen.findByText("Compte introuvable.")).toBeInTheDocument();
  });
});
