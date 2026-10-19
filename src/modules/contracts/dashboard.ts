// Calculs du tableau de bord. Fonctions pures, sans accès base ni DOM :
// chaque graphique reçoit des données déjà prêtes, et la logique se teste
// sans monter de composant.

import {
  daysInMonth,
  getMonthOccurrences,
  isDebitedInMonth,
  monthlyCost,
  type CalendarContract,
} from "./calendar";
import type { Category } from "@/modules/categories/model";
import { findCategory } from "@/modules/categories/model";

export interface ProjectionMonth {
  year: number;
  month: number;
  /** Contrats mensuels : identique d'un mois sur l'autre. */
  base: number;
  /** Trimestriels et annuels : ce qui fait varier le total. */
  extra: number;
  extras: CalendarContract[];
  total: number;
}

/**
 * Projection des prélèvements, **à partir du mois suivant**.
 *
 * Le mois courant est amputé des échéances déjà passées : le faire figurer
 * à côté de mois pleins donnerait une colonne basse qui se lit comme une
 * baisse de dépenses. Le reste à payer du mois est un chiffre à part.
 */
export function getMonthlyProjection(
  contracts: CalendarContract[],
  from: Date,
  months: number,
): ProjectionMonth[] {
  const out: ProjectionMonth[] = [];
  for (let i = 0; i < months; i++) {
    const cursor = new Date(from.getFullYear(), from.getMonth() + 1 + i, 1);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    let base = 0;
    let extra = 0;
    const extras: CalendarContract[] = [];

    for (const contract of contracts) {
      if (!isDebitedInMonth(contract, year, month)) continue;
      if (contract.frequency === "monthly") {
        base += contract.amount;
      } else {
        extra += contract.amount;
        extras.push(contract);
      }
    }
    out.push({ year, month, base, extra, extras, total: base + extra });
  }
  return out;
}

export interface CategoryLoad {
  slug: string;
  label: string;
  color: string;
  count: number;
  monthlyCost: number;
}

/** Coût mensuel lissé par catégorie, du plus lourd au plus léger. */
export function getCategoryLoad(
  contracts: CalendarContract[],
  categories: Category[],
): CategoryLoad[] {
  const totals = new Map<string, { count: number; monthlyCost: number }>();

  for (const contract of contracts) {
    // Un contrat dont la catégorie a été supprimée retombe sur « sans catégorie ».
    const slug = findCategory(categories, contract.category).slug;
    const entry = totals.get(slug) ?? { count: 0, monthlyCost: 0 };
    entry.count += 1;
    entry.monthlyCost += monthlyCost(contract);
    totals.set(slug, entry);
  }

  return [...totals.entries()]
    .map(([slug, v]) => {
      const category = findCategory(categories, slug);
      return { slug, label: category.label, color: category.color, ...v };
    })
    .sort((a, b) => b.monthlyCost - a.monthlyCost);
}

/** Contrats les plus lourds, comparés au mois pour être comparables. */
export function getTopContracts(
  contracts: CalendarContract[],
  limit: number,
): { contract: CalendarContract; monthlyCost: number }[] {
  return contracts
    .map((contract) => ({ contract, monthlyCost: monthlyCost(contract) }))
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, limit);
}

export interface DayLoad {
  day: number;
  total: number;
  names: string[];
}

/** Charge jour par jour sur un mois donné — information de trésorerie. */
export function getDayLoad(
  contracts: CalendarContract[],
  year: number,
  month: number,
): DayLoad[] {
  const days: DayLoad[] = Array.from(
    { length: daysInMonth(year, month) },
    (_, i) => ({ day: i + 1, total: 0, names: [] }),
  );

  for (const { date, contract } of getMonthOccurrences(contracts, year, month)) {
    const entry = days[date.getDate() - 1];
    entry.total += contract.amount;
    entry.names.push(contract.name);
  }
  return days;
}

export interface Renewal {
  contract: CalendarContract;
  date: Date;
  /** Rien n'avance renewalDate après l'échéance : la donnée se périme. */
  overdue: boolean;
}

export function getRenewals(
  contracts: CalendarContract[],
  today: Date,
): Renewal[] {
  return contracts
    .filter((c) => c.renewalDate !== null)
    .map((contract) => {
      const date = new Date(contract.renewalDate as string);
      return { contract, date, overdue: date < today };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Coût mensuel lissé de tout le portefeuille. */
export function getSmoothedMonthlyCost(contracts: CalendarContract[]): number {
  return contracts.reduce((sum, c) => sum + monthlyCost(c), 0);
}
