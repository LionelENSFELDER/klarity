// Données du rail de navigation, calculées côté serveur.
// Module volontairement non-client : les deux pages serveur l'importent.

import { getMonthOccurrences, getUpcomingDebits, type CalendarContract } from "./calendar";
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
