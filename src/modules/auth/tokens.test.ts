import { describe, it, expect, vi, beforeEach } from "vitest";

type Row = { identifier: string; token: string; expires: Date };
const rows: Row[] = [];
vi.mock("@/lib/db", () => ({
  prisma: {
    verificationToken: {
      create: async ({ data }: { data: Row }) => {
        rows.push(data);
      },
      findFirst: async ({ where }: { where: { token: string } }) =>
        rows.find((r) => r.token === where.token) ?? null,
      deleteMany: async ({ where }: { where: { identifier: string } }) => {
        for (let i = rows.length - 1; i >= 0; i--) {
          if (rows[i].identifier === where.identifier) rows.splice(i, 1);
        }
      },
    },
  },
}));

import { consumeToken, createToken } from "./tokens";

beforeEach(() => {
  rows.length = 0;
});

describe("jetons à usage unique", () => {
  it("rend l'e-mail une seule fois", async () => {
    const raw = await createToken("reset", "jean@example.com", 60_000);
    expect(await consumeToken("reset", raw)).toBe("jean@example.com");
    expect(await consumeToken("reset", raw)).toBeNull();
  });

  it("ne stocke que l'empreinte", async () => {
    const raw = await createToken("verify", "jean@example.com", 60_000);
    expect(rows[0].token).not.toBe(raw);
    expect(rows[0].token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("refuse un jeton expiré", async () => {
    const raw = await createToken("reset", "jean@example.com", -1);
    expect(await consumeToken("reset", raw)).toBeNull();
  });

  it("refuse un jeton d'un autre usage", async () => {
    const raw = await createToken("verify", "jean@example.com", 60_000);
    expect(await consumeToken("reset", raw)).toBeNull();
  });

  it("annule le jeton précédent quand on en redemande un", async () => {
    const first = await createToken("reset", "jean@example.com", 60_000);
    const second = await createToken("reset", "jean@example.com", 60_000);
    expect(await consumeToken("reset", first)).toBeNull();
    expect(await consumeToken("reset", second)).toBe("jean@example.com");
  });
});
