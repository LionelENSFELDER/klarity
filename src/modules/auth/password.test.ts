import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma: db }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": "1.2.3.4" }) }));
vi.mock("next-auth/next", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/mailer", () => ({ sendMail: vi.fn(), appUrl: (p: string) => `https://app${p}` }));
vi.mock("@/lib/rateLimit", () => ({ allowAttempt: vi.fn(async () => true), clientIp: () => "1.2.3.4" }));
vi.mock("./tokens", () => ({ createToken: vi.fn(async () => "jeton"), consumeToken: vi.fn() }));
// Hachage instantané : le coût bcrypt n'est pas l'objet de ces tests.
vi.mock("bcryptjs", () => ({
  default: {
    hash: async (p: string) => `hash(${p})`,
    compare: async (p: string, h: string) => h === `hash(${p})`,
  },
}));

import { getServerSession } from "next-auth/next";
import { sendMail } from "@/lib/mailer";
import { allowAttempt } from "@/lib/rateLimit";
import { consumeToken } from "./tokens";
import { ChangePassword, RequestPasswordReset, ResetPassword } from "./password";

const STRONG = "un-mot-de-passe-solide";

beforeEach(() => {
  vi.mocked(allowAttempt).mockResolvedValue(true);
});

describe("RequestPasswordReset", () => {
  it("envoie un lien quand le compte existe", async () => {
    db.user.findUnique.mockResolvedValue({ id: "u1" });
    expect(await RequestPasswordReset(" Jean@Example.com ")).toEqual({ success: true });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "jean@example.com",
        text: expect.stringContaining("https://app/auth/reinitialiser?token=jeton"),
      }),
    );
  });

  it("répond pareil sans compte, sans rien envoyer", async () => {
    db.user.findUnique.mockResolvedValue(null);
    expect(await RequestPasswordReset("inconnu@example.com")).toEqual({ success: true });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("refuse au-delà de la limite", async () => {
    vi.mocked(allowAttempt).mockResolvedValue(false);
    expect(await RequestPasswordReset("jean@example.com")).toHaveProperty("error");
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe("ResetPassword", () => {
  it("pose le mot de passe, vérifie l'adresse et ferme les sessions", async () => {
    vi.mocked(consumeToken).mockResolvedValue("jean@example.com");
    db.user.findUnique.mockResolvedValue({ id: "u1", emailVerified: null });

    expect(await ResetPassword("jeton", STRONG)).toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: {
        password: `hash(${STRONG})`,
        emailVerified: expect.any(Date),
        tokenVersion: { increment: 1 },
      },
    });
  });

  it("refuse un lien invalide", async () => {
    vi.mocked(consumeToken).mockResolvedValue(null);
    expect(await ResetPassword("faux", STRONG)).toHaveProperty("error");
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("refuse un mot de passe trop court sans consommer le lien", async () => {
    expect(await ResetPassword("jeton", "court")).toHaveProperty("error");
    expect(consumeToken).not.toHaveBeenCalled();
  });
});

describe("ChangePassword", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ id: "u1", password: "hash(ancien-mot-de-passe)" });
  });

  it("change le mot de passe et ferme les sessions", async () => {
    expect(await ChangePassword("ancien-mot-de-passe", STRONG)).toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { password: `hash(${STRONG})`, tokenVersion: { increment: 1 } },
    });
  });

  it("refuse un mot de passe actuel faux", async () => {
    expect(await ChangePassword("faux", STRONG)).toEqual({ error: "Mot de passe actuel incorrect." });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("renvoie vers « mot de passe oublié » pour un compte Google", async () => {
    db.user.findUnique.mockResolvedValue({ id: "u1", password: null });
    expect(await ChangePassword("x", STRONG)).toHaveProperty("error", expect.stringContaining("oublié"));
  });

  it("exige une session", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    expect(await ChangePassword("x", STRONG)).toHaveProperty("error");
  });
});
