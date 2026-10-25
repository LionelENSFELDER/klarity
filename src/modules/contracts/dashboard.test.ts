import { describe, it, expect } from "vitest";
import {
  OTHER_PROVIDERS,
  getCategoryLoad,
  getCategoryProviderFlows,
  getDayLoad,
  getMonthlyProjection,
  getRenewals,
  getSmoothedMonthlyCost,
  getTopContracts,
} from "./dashboard";
import type { CalendarContract } from "./calendar";
import type { Category } from "@/modules/categories/model";

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

const categories: Category[] = [
  { id: "1", slug: "abonnement", label: "Abonnements", color: "#f472b6", position: 0 },
  { id: "2", slug: "energie", label: "Énergie", color: "#fbbf24", position: 1 },
];

// 19 octobre 2026
const TODAY = new Date(2026, 9, 19);

describe("getMonthlyProjection", () => {
  it("démarre au mois suivant, jamais sur le mois courant amputé", () => {
    const proj = getMonthlyProjection([make({})], TODAY, 3);
    expect(proj).toHaveLength(3);
    expect(proj[0].month).toBe(10); // novembre
    expect(proj[0].year).toBe(2026);
  });

  it("sépare le socle mensuel des échéances ponctuelles", () => {
    const proj = getMonthlyProjection(
      [
        make({ id: "m", amount: 100, frequency: "monthly" }),
        make({ id: "t", amount: 90, frequency: "quarterly", anchorMonth: 0 }),
      ],
      TODAY,
      4,
    );

    // Trimestriel ancré en janvier : janvier, avril, juillet, octobre.
    expect(proj.map((p) => p.base)).toEqual([100, 100, 100, 100]);
    expect(proj.map((p) => p.extra)).toEqual([0, 0, 90, 0]);
    expect(proj[2].total).toBe(190);
    expect(proj[2].extras.map((c) => c.id)).toEqual(["t"]);
  });

  it("nomme ce qui s'ajoute, pour que le surcoût soit explicable", () => {
    const annuel = make({ id: "a", name: "Assurance vie", amount: 120, frequency: "annual", anchorMonth: 2 });
    const proj = getMonthlyProjection([annuel], TODAY, 12);
    const mars = proj.find((p) => p.month === 2);

    expect(mars?.extra).toBe(120);
    expect(mars?.extras[0].name).toBe("Assurance vie");
    // Les onze autres mois ne portent rien.
    expect(proj.filter((p) => p.extra > 0)).toHaveLength(1);
  });

  it("franchit correctement le passage à l'année suivante", () => {
    const proj = getMonthlyProjection([make({})], new Date(2026, 10, 19), 3);
    expect(proj.map((p) => [p.year, p.month])).toEqual([
      [2026, 11],
      [2027, 0],
      [2027, 1],
    ]);
  });
});

describe("getCategoryLoad", () => {
  it("additionne le coût lissé et trie du plus lourd au plus léger", () => {
    const load = getCategoryLoad(
      [
        make({ id: "a", category: "abonnement", amount: 12 }),
        make({ id: "b", category: "energie", amount: 300, frequency: "quarterly" }),
        make({ id: "c", category: "energie", amount: 50 }),
      ],
      categories,
    );

    expect(load.map((x) => x.slug)).toEqual(["energie", "abonnement"]);
    expect(load[0].monthlyCost).toBe(150); // 300/3 + 50
    expect(load[0].count).toBe(2);
    expect(load[0].color).toBe("#fbbf24");
  });

  it("regroupe sous « sans catégorie » un slug devenu inconnu", () => {
    const load = getCategoryLoad([make({ category: "supprimee" })], categories);
    expect(load[0].label).toBe("Sans catégorie");
  });

  it("ignore les catégories sans contrat", () => {
    const load = getCategoryLoad([make({ category: "abonnement" })], categories);
    expect(load.map((x) => x.slug)).toEqual(["abonnement"]);
  });
});

describe("getTopContracts", () => {
  it("classe par coût ramené au mois, pas par montant brut", () => {
    // 1200 € par an pèse moins qu'un abonnement de 150 € par mois.
    const top = getTopContracts(
      [
        make({ id: "annuel", amount: 1200, frequency: "annual", anchorMonth: 0 }),
        make({ id: "mensuel", amount: 150 }),
      ],
      2,
    );
    expect(top.map((x) => x.contract.id)).toEqual(["mensuel", "annuel"]);
    expect(top[1].monthlyCost).toBe(100);
  });

  it("respecte la limite demandée", () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      make({ id: String(i), amount: i }),
    );
    expect(getTopContracts(many, 6)).toHaveLength(6);
  });
});

describe("getDayLoad", () => {
  it("couvre tous les jours du mois, y compris les vides", () => {
    const days = getDayLoad([make({ debitDay: 5 })], 2026, 9);
    expect(days).toHaveLength(31);
    expect(days[4]).toMatchObject({ day: 5, total: 10 });
    expect(days[0].total).toBe(0);
  });

  it("cumule plusieurs prélèvements le même jour et les nomme", () => {
    const days = getDayLoad(
      [
        make({ id: "a", name: "Loyer", amount: 800, debitDay: 5 }),
        make({ id: "b", name: "Assurance", amount: 45, debitDay: 5 }),
      ],
      2026,
      9,
    );
    expect(days[4].total).toBe(845);
    expect(days[4].names).toEqual(["Loyer", "Assurance"]);
  });

  it("ramène un prélèvement du 31 au dernier jour d'un mois court", () => {
    const days = getDayLoad([make({ debitDay: 31 })], 2027, 1); // février
    expect(days).toHaveLength(28);
    expect(days[27].total).toBe(10);
  });
});

describe("getRenewals", () => {
  it("trie par date et signale celles déjà dépassées", () => {
    const renewals = getRenewals(
      [
        make({ id: "futur", renewalDate: "2027-01-10" }),
        make({ id: "passe", renewalDate: "2026-03-15" }),
        make({ id: "sans", renewalDate: null }),
      ],
      TODAY,
    );

    expect(renewals.map((r) => r.contract.id)).toEqual(["passe", "futur"]);
    expect(renewals[0].overdue).toBe(true);
    expect(renewals[1].overdue).toBe(false);
  });
});

describe("getSmoothedMonthlyCost", () => {
  it("ramène chaque fréquence au mois avant d'additionner", () => {
    const total = getSmoothedMonthlyCost([
      make({ amount: 100, frequency: "monthly" }),
      make({ amount: 90, frequency: "quarterly" }),
      make({ amount: 120, frequency: "annual" }),
      make({ amount: 500, frequency: "once" }),
    ]);
    expect(total).toBe(140); // 100 + 30 + 10 + 0
  });
});

describe("getCategoryProviderFlows", () => {
  it("cumule par couple catégorie-fournisseur, en coût lissé, sans les ponctuels", () => {
    const flows = getCategoryProviderFlows(
      [
        make({ id: "a", provider: "EDF", category: "energie", amount: 60 }),
        make({ id: "b", provider: "EDF", category: "energie", amount: 30 }),
        make({ id: "c", provider: "EDF", category: "abonnement", amount: 120, frequency: "annual", anchorMonth: 0 }),
        make({ id: "d", provider: "Billet", category: "abonnement", amount: 50, frequency: "once" }),
      ],
      categories,
      8,
    );
    expect(flows).toEqual([
      { category: "energie", provider: "EDF", monthlyCost: 90 },
      { category: "abonnement", provider: "EDF", monthlyCost: 10 },
    ]);
  });

  it("regroupe les fournisseurs les plus légers au-delà du maximum", () => {
    const contracts = ["A", "B", "C", "D"].map((p, i) =>
      make({ id: p, provider: p, amount: 40 - i * 10 }),
    );
    const providers = (max: number) =>
      getCategoryProviderFlows(contracts, categories, max).map((f) => f.provider);

    expect(providers(2)).toEqual(["A", "B", OTHER_PROVIDERS]);
    // Un seul fournisseur à regrouper : on le garde sous son nom.
    expect(providers(3)).toEqual(["A", "B", "C", "D"]);
  });
});
