import { describe, it, expect, vi } from "vitest";

const compare = vi.hoisted(() => vi.fn(async (p: string, h: string) => h === `hash(${p})`));
vi.mock("bcryptjs", () => ({
  default: { compare, hash: async (p: string) => `hash(${p})` },
}));

import { checkPassword } from "./checkPassword";

describe("checkPassword", () => {
  it("compare au mot de passe du compte", async () => {
    expect(await checkPassword("secret", "hash(secret)")).toBe(true);
    expect(await checkPassword("faux", "hash(secret)")).toBe(false);
  });

  it("fait quand même une comparaison sans compte, et refuse", async () => {
    // Même avec le mot de passe de l'empreinte factice : jamais de succès.
    expect(await checkPassword("klarity-compte-inexistant", null)).toBe(false);
    expect(compare).toHaveBeenCalledTimes(1);
  });
});
