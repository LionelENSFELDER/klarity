import { describe, it, expect } from "vitest";
import { buildSidebarCounts } from "./sidebar";
import type { CalendarContract } from "./calendar";

const make = (over: Partial<CalendarContract>): CalendarContract => ({
  id: "c1",
  name: "Contrat",
  provider: "Fournisseur",
  contractNumber: null,
  category: "abonnement",
  amount: 10,
  frequency: "monthly",
  debitDay: 15,
  anchorMonth: null,
  startDate: null,
  renewalDate: null,
  ...over,
});

// 24 octobre 2026
const TODAY = new Date(2026, 9, 24);

describe("buildSidebarCounts — mois en cours", () => {
  it("sépare le déjà prélevé du reste, le jour même restant à venir", () => {
    const counts = buildSidebarCounts(
      [
        make({ id: "a", amount: 100, debitDay: 5 }),
        make({ id: "b", amount: 20, debitDay: 24 }),
        make({ id: "c", amount: 7, debitDay: 30 }),
        // Annuel prélevé en janvier : hors du mois.
        make({ id: "d", amount: 400, frequency: "annual", anchorMonth: 0, debitDay: 3 }),
      ],
      [],
      [],
      3,
      TODAY,
    );
    expect(counts.monthTotal).toBe(127);
    expect(counts.monthPaid).toBe(100);
  });
});
