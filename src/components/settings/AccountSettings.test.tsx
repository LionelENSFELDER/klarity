import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountSettings from "./AccountSettings";
import { signOut } from "next-auth/react";
import { DeleteAccount, SignOutEverywhere } from "@/modules/account/actions";
import { ChangePassword } from "@/modules/auth/password";

vi.mock("next-auth/react", () => ({ signOut: vi.fn() }));
vi.mock("@/modules/auth/password", () => ({ ChangePassword: vi.fn() }));
vi.mock("@/modules/account/actions", () => ({
  DeleteAccount: vi.fn(),
  SignOutEverywhere: vi.fn(),
}));

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

  it("ferme toutes les sessions puis déconnecte cet appareil", async () => {
    const user = userEvent.setup();
    vi.mocked(SignOutEverywhere).mockResolvedValue({ success: true });
    render(<AccountSettings email="jean@example.com" />);

    await user.click(screen.getByRole("button", { name: "Se déconnecter de tous les appareils" }));

    expect(SignOutEverywhere).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: expect.stringContaining("/auth/signin"),
    });
  });

  it("change le mot de passe puis déconnecte", async () => {
    const user = userEvent.setup();
    vi.mocked(ChangePassword).mockResolvedValue({ success: true });
    render(<AccountSettings email="jean@example.com" />);

    await user.type(screen.getByLabelText(/Mot de passe actuel/), "ancien-mot-de-passe");
    await user.type(screen.getByLabelText(/Nouveau mot de passe/), "nouveau-mot-de-passe");
    await user.click(screen.getByRole("button", { name: "Changer le mot de passe" }));

    expect(ChangePassword).toHaveBeenCalledWith("ancien-mot-de-passe", "nouveau-mot-de-passe");
    expect(signOut).toHaveBeenCalled();
  });

  it("renvoie un compte Google vers « mot de passe oublié »", () => {
    render(<AccountSettings email="jean@example.com" hasPassword={false} />);
    expect(screen.queryByLabelText(/Mot de passe actuel/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mot de passe oublié/ })).toHaveAttribute(
      "href",
      "/auth/mot-de-passe-oublie",
    );
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
