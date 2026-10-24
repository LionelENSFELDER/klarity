import { describe, it, expect } from "vitest";
import { dotUnit } from "./DashboardView";

describe("dotUnit", () => {
  it("prend un pas rond qui garde le jour le plus chargé sous 12 points", () => {
    expect(dotUnit(40)).toBe(5);
    expect(dotUnit(183.41)).toBe(20);
    expect(dotUnit(600)).toBe(50);
  });

  it("sort de la liste des pas ronds pour les très gros montants", () => {
    expect(dotUnit(12_000)).toBe(1000);
  });
});
