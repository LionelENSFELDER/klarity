import { describe, it, expect } from "vitest";
import { allowAttempt, clientIp, isLimited, recordAttempt } from "./rateLimit";

describe("allowAttempt", () => {
  it("bloque au-delà de la limite puis relâche après la fenêtre", () => {
    const key = `test-${Math.random()}`;
    const t0 = 1_000_000;
    expect(allowAttempt(key, 2, 60_000, t0)).toBe(true);
    expect(allowAttempt(key, 2, 60_000, t0 + 1)).toBe(true);
    expect(allowAttempt(key, 2, 60_000, t0 + 2)).toBe(false);
    expect(allowAttempt(key, 2, 60_000, t0 + 60_001)).toBe(true);
  });

  it("compte chaque clé séparément", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(allowAttempt(a, 1, 60_000)).toBe(true);
    expect(allowAttempt(a, 1, 60_000)).toBe(false);
    expect(allowAttempt(b, 1, 60_000)).toBe(true);
  });
});

describe("isLimited / recordAttempt", () => {
  it("ne compte que ce qui est enregistré : vérifier ne consomme rien", () => {
    const key = `check-${Math.random()}`;
    for (let i = 0; i < 20; i++) expect(isLimited(key, 2, 60_000)).toBe(false);
    recordAttempt(key);
    recordAttempt(key);
    expect(isLimited(key, 2, 60_000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("prend la première adresse de x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp({ "x-forwarded-for": "5.6.7.8" })).toBe("5.6.7.8");
    expect(clientIp(undefined)).toBeNull();
  });
});
