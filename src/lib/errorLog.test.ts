import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/rateLimit", () => ({
  allowAttempt: vi.fn(async () => true),
  clientIp: () => "1.2.3.4",
}));

import { allowAttempt } from "@/lib/rateLimit";
import { logError } from "./errorLog";
import { POST } from "@/app/api/errors/route";

let lines: Record<string, string>[] = [];
beforeEach(() => {
  lines = [];
  vi.spyOn(console, "error").mockImplementation((line: string) => {
    lines.push(JSON.parse(line));
  });
});

const post = (body: string) =>
  POST(new NextRequest("https://app/api/errors", { method: "POST", body }));

describe("logError", () => {
  it("écrit une ligne JSON sans les paramètres d'URL", () => {
    logError({ source: "server", message: "boom", path: "/auth/reinitialiser?token=secret" });
    expect(lines[0]).toMatchObject({ level: "error", source: "server", message: "boom", path: "/auth/reinitialiser" });
    expect(JSON.stringify(lines[0])).not.toContain("secret");
  });

  it("tronque les champs trop longs", () => {
    logError({ source: "client", message: "x".repeat(5000) });
    expect(lines[0].message).toHaveLength(500);
  });
});

describe("POST /api/errors", () => {
  it("journalise un plantage du navigateur", async () => {
    const res = await post(JSON.stringify({ message: "rendu", digest: "abc", path: "/calendar?x=1" }));
    expect(res.status).toBe(204);
    expect(lines[0]).toMatchObject({ source: "client", message: "rendu", digest: "abc", path: "/calendar" });
  });

  it("refuse un corps trop gros ou illisible", async () => {
    expect((await post("x".repeat(3000))).status).toBe(413);
    expect((await post("pas du json")).status).toBe(400);
    expect(lines).toHaveLength(0);
  });

  it("freine les rafales", async () => {
    vi.mocked(allowAttempt).mockResolvedValueOnce(false);
    expect((await post("{}")).status).toBe(429);
  });
});
