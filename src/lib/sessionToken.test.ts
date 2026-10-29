import { describe, it, expect } from "vitest";
import { resolveToken } from "./sessionToken";

const versions = (v: number | null) => async () => v;

describe("resolveToken", () => {
  it("pose l'identifiant et la version à la connexion", async () => {
    expect(await resolveToken({ name: "Jean" }, "u1", versions(3))).toEqual({
      name: "Jean",
      sub: "u1",
      ver: 3,
    });
  });

  it("garde un jeton dont la version est à jour", async () => {
    const token = { sub: "u1", ver: 2 };
    expect(await resolveToken(token, undefined, versions(2))).toBe(token);
  });

  it("vide le jeton après un changement de version", async () => {
    expect(await resolveToken({ sub: "u1", ver: 1 }, undefined, versions(2))).toEqual({});
  });

  it("vide le jeton d'un compte supprimé", async () => {
    expect(await resolveToken({ sub: "u1", ver: 0 }, undefined, versions(null))).toEqual({});
  });

  it("accepte un ancien jeton sans version tant que la version vaut 0", async () => {
    const token = { sub: "u1" };
    expect(await resolveToken(token, undefined, versions(0))).toBe(token);
    expect(await resolveToken(token, undefined, versions(1))).toEqual({});
  });
});
