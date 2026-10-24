// Données du rail de navigation, calculées côté serveur.
// Module volontairement non-client : les deux pages serveur l'importent.

import {
  getMonthDebits,
  getMonthOccurrences,
  getUpcomingDebits,
  type CalendarContract,
} from "./calendar";
import type { Category } from "@/modules/categories/model";

export interface ProviderUsage {
  name: string;
  count: number;
  monthlyCost: number;
}

export interface SidebarCounts {
  aVenir: number;
  mois: number;
  tout: number;
  byCategory: Record<string, number>;
  orphans: number;
  providers: ProviderUsage[];
  /** Total des prélèvements du mois en cours. */
  monthTotal: number;
  /** Part déjà prélevée : les jours avant aujourd'hui. */
  monthPaid: number;
}

export interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function buildSidebarCounts(
  contracts: CalendarContract[],
  categories: Category[],
  providers: ProviderUsage[],
  horizon: number,
  today: Date,
): SidebarCounts {
  const known = new Set(categories.map((c) => c.slug));
  const days = [
    ...getMonthDebits(contracts, today.getFullYear(), today.getMonth()).values(),
  ];
  return {
    aVenir: getUpcomingDebits(contracts, today, horizon).length,
    mois: getMonthOccurrences(contracts, today.getFullYear(), today.getMonth())
      .length,
    tout: contracts.length,
    byCategory: Object.fromEntries(
      categories.map((c) => [
        c.slug,
        contracts.filter((x) => x.category === c.slug).length,
      ]),
    ),
    orphans: contracts.filter((c) => !known.has(c.category)).length,
    providers,
    monthTotal: days.reduce((sum, d) => sum + d.total, 0),
    monthPaid: days
      .filter((d) => d.day < today.getDate())
      .reduce((sum, d) => sum + d.total, 0),
  };
}

/** Initiales affichées dans l'avatar quand l'utilisateur n'a pas de photo. */
export function getUserInitials(name?: string | null): string {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??"
  );
}
