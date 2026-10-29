import { describe, it, expect } from "vitest";
import { normalizeEmail } from "@/lib/email";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePassword,
  validateRegistration,
} from "./registration";

const valid = {
  name: "Jean Dupont",
  email: "jean@example.com",
  password: "motdepasse-solide",
};

describe("normalizeEmail", () => {
  // L'index unique de Postgres est sensible à la casse : sans ça,
  // s'inscrire en majuscules rend la connexion en minuscules impossible.
  it("met en minuscules et retire les espaces", () => {
    expect(normalizeEmail("  Jean@Example.COM ")).toBe("jean@example.com");
  });

  it("laisse intacte une adresse déjà canonique", () => {
    expect(normalizeEmail("jean@example.com")).toBe("jean@example.com");
  });
});

describe("validateRegistration", () => {
  it("accepte une inscription valide et renvoie l'email normalisé", () => {
    const result = validateRegistration({ ...valid, email: " JEAN@Example.com " });
    expect(result).toEqual({
      ok: true,
      name: "Jean Dupont",
      email: "jean@example.com",
      password: "motdepasse-solide",
    });
  });

  it("refuse un email ou un mot de passe absent", () => {
    expect(validateRegistration({ password: "motdepasse-solide" })).toMatchObject({ ok: false });
    expect(validateRegistration({ email: "jean@example.com" })).toMatchObject({ ok: false });
    expect(validateRegistration({})).toMatchObject({ ok: false });
  });

  it("refuse un email composé uniquement d'espaces", () => {
    expect(validateRegistration({ ...valid, email: "   " })).toMatchObject({
      ok: false,
      error: "Email et mot de passe requis",
    });
  });

  it("refuse une adresse mal formée", () => {
    for (const email of ["jean", "jean@", "@example.com", "jean@example", "a b@c.fr"]) {
      expect(validateRegistration({ ...valid, email })).toMatchObject({
        ok: false,
        error: "Adresse e-mail invalide",
      });
    }
  });

  it("impose la longueur minimale du mot de passe", () => {
    const short = "a".repeat(PASSWORD_MIN_LENGTH - 1);
    const exact = "a".repeat(PASSWORD_MIN_LENGTH);

    expect(validateRegistration({ ...valid, password: short })).toMatchObject({ ok: false });
    expect(validateRegistration({ ...valid, password: exact })).toMatchObject({ ok: true });
  });

  it("borne la longueur du mot de passe et du nom", () => {
    const max = "a".repeat(PASSWORD_MAX_LENGTH);
    expect(validateRegistration({ ...valid, password: max })).toMatchObject({ ok: true });
    expect(validateRegistration({ ...valid, password: max + "a" })).toMatchObject({ ok: false });
    expect(validateRegistration({ ...valid, name: "a".repeat(101) })).toMatchObject({ ok: false });
  });

  it("compte la borne haute en octets, pas en caractères", () => {
    // « é » occupe 2 octets : 37 caractères, 74 octets.
    const accents = "é".repeat(37);
    expect(validatePassword(accents)).toMatch(/octets/);
    expect(validatePassword("é".repeat(36))).toBeNull();
  });

  it("ne tronque ni ne modifie le mot de passe", () => {
    const password = "  espaces en bordure  ";
    const result = validateRegistration({ ...valid, password });
    expect(result).toMatchObject({ ok: true, password });
  });

  it("réduit un nom vide ou blanc à null", () => {
    expect(validateRegistration({ ...valid, name: "   " })).toMatchObject({ name: null });
    expect(validateRegistration({ email: valid.email, password: valid.password })).toMatchObject({
      name: null,
    });
    expect(validateRegistration({ ...valid, name: "  Jean  " })).toMatchObject({ name: "Jean" });
  });

  it("ignore les champs qui ne sont pas des chaînes", () => {
    expect(validateRegistration({ email: 42, password: valid.password })).toMatchObject({
      ok: false,
    });
    expect(validateRegistration({ ...valid, name: { toString: () => "x" } })).toMatchObject({
      ok: true,
      name: null,
    });
  });

  it("fait correspondre deux casses différentes à la même adresse", () => {
    const a = validateRegistration({ ...valid, email: "Jean@Example.com" });
    const b = validateRegistration({ ...valid, email: "jean@EXAMPLE.COM" });
    expect(a.ok && b.ok && a.email === b.email).toBe(true);
  });
});
