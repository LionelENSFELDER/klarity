import { describe, it, expect } from "vitest";
import {
  debitMonths,
  effectiveDebitDay,
  getNextOccurrence,
  getUpcomingDebits,
  groupByDay,
  groupByMonth,
  monthlyCost,
  relativeDay,
  resolveAnchorMonth,
  type CalendarContract,
} from "./calendar";

const base: CalendarContract = {
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
};

const make = (over: Partial<CalendarContract>): CalendarContract => ({
  ...base,
  ...over,
});

// 18 octobre 2026
const TODAY = new Date(2026, 9, 18);

describe("getUpcomingDebits", () => {
  it("déplie un contrat mensuel une fois par mois sur l'horizon", () => {
    const occ = getUpcomingDebits([make({ debitDay: 20 })], TODAY, 3);
    expect(occ).toHaveLength(3);
    expect(occ.map((o) => [o.date.getMonth(), o.date.getDate()])).toEqual([
      [9, 20],
      [10, 20],
      [11, 20],
    ]);
  });

  it("écarte une occurrence du mois courant déjà passée", () => {
    // Prélèvement le 8 : octobre est écarté, novembre et décembre restent.
    const occ = getUpcomingDebits([make({ debitDay: 8 })], TODAY, 3);
    expect(occ).toHaveLength(2);
    expect(occ[0].date.getMonth()).toBe(10);
  });

  it("respecte le mois d'ancrage d'un contrat trimestriel", () => {
    const quarterly = make({ frequency: "quarterly", anchorMonth: 0, debitDay: 25 });
    // Ancré en janvier : avril, juillet, octobre, janvier.
    const occ = getUpcomingDebits([quarterly], TODAY, 12);
    expect(occ.map((o) => o.date.getMonth())).toEqual([9, 0, 3, 6]);
  });

  it("ne sort un contrat annuel que sur son mois d'ancrage", () => {
    const annual = make({ frequency: "annual", anchorMonth: 2, debitDay: 20 });
    expect(getUpcomingDebits([annual], TODAY, 3)).toHaveLength(0);

    const wide = getUpcomingDebits([annual], TODAY, 12);
    expect(wide).toHaveLength(1);
    expect(wide[0].date.getMonth()).toBe(2);
    expect(wide[0].date.getFullYear()).toBe(2027);
  });

  it("inclut un prélèvement unique futur et exclut un passé", () => {
    const future = make({
      id: "futur",
      frequency: "once",
      startDate: new Date(2026, 10, 3).toISOString(),
      debitDay: 3,
    });
    const past = make({
      id: "passe",
      frequency: "once",
      startDate: new Date(2026, 4, 12).toISOString(),
      debitDay: 12,
    });

    const occ = getUpcomingDebits([future, past], TODAY, 6);
    expect(occ.map((o) => o.contract.id)).toEqual(["futur"]);
  });

  it("trie les occurrences par date croissante", () => {
    const occ = getUpcomingDebits(
      [make({ id: "tard", debitDay: 28 }), make({ id: "tot", debitDay: 20 })],
      TODAY,
      1,
    );
    expect(occ.map((o) => o.contract.id)).toEqual(["tot", "tard"]);
  });
});

describe("effectiveDebitDay", () => {
  it("ramène un prélèvement du 31 au dernier jour d'un mois plus court", () => {
    expect(effectiveDebitDay(make({ debitDay: 31 }), 2027, 1)).toBe(28);
    expect(effectiveDebitDay(make({ debitDay: 31 }), 2028, 1)).toBe(29); // bissextile
    expect(effectiveDebitDay(make({ debitDay: 31 }), 2026, 0)).toBe(31);
  });
});

describe("getNextOccurrence", () => {
  it("trouve la prochaine échéance au-delà de l'horizon affiché", () => {
    const annual = make({ frequency: "annual", anchorMonth: 2, debitDay: 20 });
    const next = getNextOccurrence(annual, TODAY);
    expect(next?.getMonth()).toBe(2);
    expect(next?.getFullYear()).toBe(2027);
  });

  it("renvoie null pour un prélèvement unique déjà passé", () => {
    const past = make({
      frequency: "once",
      startDate: new Date(2026, 4, 12).toISOString(),
    });
    expect(getNextOccurrence(past, TODAY)).toBeNull();
  });
});

describe("groupByMonth", () => {
  it("regroupe par mois et totalise chaque groupe", () => {
    const occ = getUpcomingDebits(
      [make({ amount: 10, debitDay: 20 }), make({ id: "c2", amount: 5, debitDay: 25 })],
      TODAY,
      2,
    );
    const groups = groupByMonth(occ);
    expect(groups).toHaveLength(2);
    expect(groups[0].total).toBe(15);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].month).toBe(10);
  });
});

describe("groupByDay", () => {
  it("regroupe les contrats du même jour et totalise", () => {
    const occ = getUpcomingDebits(
      [
        make({ amount: 10, debitDay: 20 }),
        make({ id: "c2", amount: 5, debitDay: 20 }),
        make({ id: "c3", amount: 7, debitDay: 25 }),
      ],
      TODAY,
      2,
    );
    const groups = groupByDay(occ);
    // 20 et 25 octobre, puis 20 et 25 novembre.
    expect(groups).toHaveLength(4);
    expect(groups[0].date).toEqual(new Date(2026, 9, 20));
    expect(groups[0].total).toBe(15);
    expect(groups[0].items).toHaveLength(2);
    expect(groups[2].date).toEqual(new Date(2026, 10, 20));
  });
});

describe("relativeDay", () => {
  it("nomme les jours proches et compte les autres", () => {
    expect(relativeDay(new Date(2026, 9, 18), TODAY)).toBe("Aujourd'hui");
    expect(relativeDay(new Date(2026, 9, 19), TODAY)).toBe("Demain");
    expect(relativeDay(new Date(2026, 9, 17), TODAY)).toBe("Hier");
    // Passage à l'heure d'hiver le 25 octobre : le décompte reste entier.
    expect(relativeDay(new Date(2026, 10, 1), TODAY)).toBe("Dans 14 jours");
    expect(relativeDay(new Date(2026, 9, 10), TODAY)).toBe("Il y a 8 jours");
  });
});

describe("resolveAnchorMonth", () => {
  it("garde le mois d'un trimestriel ou d'un annuel déjà ancré", () => {
    expect(resolveAnchorMonth("annual", 0, TODAY)).toBe(0);
    expect(resolveAnchorMonth("quarterly", 1, TODAY)).toBe(1);
  });

  it("ancre sur le mois en cours quand il n'y en a pas encore", () => {
    expect(resolveAnchorMonth("annual", null, TODAY)).toBe(9);
  });

  it("n'ancre ni les mensuels ni les ponctuels", () => {
    expect(resolveAnchorMonth("monthly", 3, TODAY)).toBeNull();
    expect(resolveAnchorMonth("once", null, TODAY)).toBeNull();
  });
});

describe("debitMonths", () => {
  it("donne le mois d'un annuel et les quatre mois d'un trimestriel", () => {
    expect(debitMonths("annual", 0)).toEqual([0]);
    expect(debitMonths("quarterly", 10)).toEqual([1, 4, 7, 10]);
    // Sans ancre, janvier : la même règle que pour le calendrier.
    expect(debitMonths("annual", null)).toEqual([0]);
    expect(debitMonths("monthly", 3)).toEqual([]);
  });
});

describe("monthlyCost", () => {
  it("ramène chaque fréquence au mois", () => {
    expect(monthlyCost(make({ amount: 30, frequency: "monthly" }))).toBe(30);
    expect(monthlyCost(make({ amount: 30, frequency: "quarterly" }))).toBe(10);
    expect(monthlyCost(make({ amount: 120, frequency: "annual" }))).toBe(10);
    expect(monthlyCost(make({ amount: 50, frequency: "once" }))).toBe(0);
  });
});
