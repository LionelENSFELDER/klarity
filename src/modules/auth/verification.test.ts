import { describe, it, expect, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/lib/mailer", () => ({ sendMail: vi.fn(), appUrl: (p: string) => `https://app${p}` }));
vi.mock("@/lib/rateLimit", () => ({ allowAttempt: vi.fn(async () => true) }));
vi.mock("./tokens", () => ({ createToken: vi.fn(async () => "jeton"), consumeToken: vi.fn() }));
vi.mock("bcryptjs", () => ({ default: { hash: async (p: string) => `hash(${p})` } }));

import { sendMail } from "@/lib/mailer";
import { consumeToken } from "./tokens";
import { registerAccount, verifyEmail } from "./verification";
import { ResendVerification } from "./verifyActions";

const input = { ok: true as const, email: "jean@example.com", name: "Jean", password: "motdepasse-solide" };
const sentText = () => vi.mocked(sendMail).mock.calls[0][0].text;

describe("registerAccount", () => {
  it("crée le compte et envoie le lien de vérification", async () => {
    db.user.findUnique.mockResolvedValue(null);
    await registerAccount(input);
    expect(db.user.create).toHaveBeenCalledWith({
      data: { email: "jean@example.com", name: "Jean", password: "hash(motdepasse-solide)" },
    });
    expect(sentText()).toContain("https://app/auth/verifier?token=jeton");
  });

  it("prévient le titulaire d'un compte vérifié sans rien modifier", async () => {
    db.user.findUnique.mockResolvedValue({ id: "u1", emailVerified: new Date(), accounts: [] });
    await registerAccount(input);
    expect(db.user.create).not.toHaveBeenCalled();
    expect(db.user.update).not.toHaveBeenCalled();
    expect(vi.mocked(sendMail).mock.calls[0][0].subject).toContain("existe déjà");
  });

  it("traite un compte Google comme un compte vérifié", async () => {
    db.user.findUnique.mockResolvedValue({ id: "u1", emailVerified: null, accounts: [{ id: "a1" }] });
    await registerAccount(input);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("remplace un compte jamais vérifié et renvoie le lien", async () => {
    db.user.findUnique.mockResolvedValue({ id: "u1", emailVerified: null, accounts: [] });
    await registerAccount(input);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { name: "Jean", password: "hash(motdepasse-solide)" },
    });
    expect(sentText()).toContain("/auth/verifier");
  });
});

describe("verifyEmail", () => {
  it("marque l'adresse vérifiée", async () => {
    vi.mocked(consumeToken).mockResolvedValue("jean@example.com");
    db.user.findUnique.mockResolvedValue({ id: "u1", emailVerified: null });
    expect(await verifyEmail("jeton")).toBe("jean@example.com");
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { emailVerified: expect.any(Date) },
    });
  });

  it("refuse un lien invalide", async () => {
    vi.mocked(consumeToken).mockResolvedValue(null);
    expect(await verifyEmail("faux")).toBeNull();
    expect(db.user.update).not.toHaveBeenCalled();
  });
});

describe("ResendVerification", () => {
  it("renvoie le lien à un compte non vérifié", async () => {
    db.user.findUnique.mockResolvedValue({ password: "h", emailVerified: null });
    expect(await ResendVerification("Jean@Example.com")).toEqual({ success: true });
    expect(sendMail).toHaveBeenCalled();
  });

  it("répond pareil sans compte, sans rien envoyer", async () => {
    db.user.findUnique.mockResolvedValue(null);
    expect(await ResendVerification("inconnu@example.com")).toEqual({ success: true });
    expect(sendMail).not.toHaveBeenCalled();
  });
});
