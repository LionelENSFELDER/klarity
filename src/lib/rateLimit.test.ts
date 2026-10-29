import { describe, it, expect, vi, beforeEach } from "vitest";

// Table en mémoire qui imite les trois requêtes Prisma du limiteur.
const rows: { key: string; createdAt: Date }[] = [];
vi.mock("./db", () => ({
  prisma: {
    rateLimitHit: {
      count: async ({ where }: { where: { key: string; createdAt: { gte: Date } } }) =>
        rows.filter((r) => r.key === where.key && r.createdAt >= where.createdAt.gte).length,
      create: async ({ data }: { data: { key: string; createdAt: Date } }) => {
        rows.push(data);
      },
      deleteMany: async ({ where }: { where: { createdAt: { lt: Date } } }) => {
        for (let i = rows.length - 1; i >= 0; i--) {
          if (rows[i].createdAt < where.createdAt.lt) rows.splice(i, 1);
        }
      },
    },
  },
}));

import { allowAttempt, clientIp, isLimited, recordAttempt } from "./rateLimit";

beforeEach(() => {
  rows.length = 0;
});

describe("allowAttempt", () => {
  it("bloque au-delà de la limite puis relâche après la fenêtre", async () => {
    const t0 = 1_000_000_000;
    expect(await allowAttempt("k", 2, 60_000, t0)).toBe(true);
    expect(await allowAttempt("k", 2, 60_000, t0 + 1)).toBe(true);
    expect(await allowAttempt("k", 2, 60_000, t0 + 2)).toBe(false);
    expect(await allowAttempt("k", 2, 60_000, t0 + 60_002)).toBe(true);
  });

  it("compte chaque clé séparément", async () => {
    expect(await allowAttempt("a", 1, 60_000)).toBe(true);
    expect(await allowAttempt("a", 1, 60_000)).toBe(false);
    expect(await allowAttempt("b", 1, 60_000)).toBe(true);
  });
});

describe("isLimited / recordAttempt", () => {
  it("ne compte que ce qui est enregistré : vérifier ne consomme rien", async () => {
    for (let i = 0; i < 20; i++) expect(await isLimited("check", 2, 60_000)).toBe(false);
    expect(rows).toHaveLength(0);
    await recordAttempt("check");
    await recordAttempt("check");
    expect(await isLimited("check", 2, 60_000)).toBe(true);
  });

  it("ne stocke jamais la clé en clair", async () => {
    await recordAttempt("login:jean@example.com");
    expect(rows[0].key).not.toContain("jean");
    expect(rows[0].key).toMatch(/^[0-9a-f]{64}$/);
  });

  it("purge les tentatives de plus de 24 h", async () => {
    const t0 = 1_000_000_000;
    await recordAttempt("old", t0);
    await recordAttempt("new", t0 + 25 * 60 * 60 * 1000);
    expect(rows).toHaveLength(1);
  });
});

describe("clientIp", () => {
  it("prend la première adresse de x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp({ "x-forwarded-for": "5.6.7.8" })).toBe("5.6.7.8");
    expect(clientIp(undefined)).toBeNull();
  });
});
