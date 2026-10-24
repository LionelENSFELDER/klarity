// Logique de calcul des prélèvements sur un mois donné.

export interface CalendarContract {
  id: string;
  name: string;
  provider: string;
  contractNumber: string | null;
  category: string;
  amount: number;
  frequency: string; // once | monthly | quarterly | annual
  debitDay: number; // 1-31
  anchorMonth: number | null; // 0-11
  startDate: string | null; // ISO — date du prélèvement unique (frequency "once")
  renewalDate: string | null; // ISO
  iconType?: string | null;
  iconValue?: string | null;
}

export interface DayDebit {
  day: number; // jour du mois (1-31)
  contracts: CalendarContract[];
  total: number;
}

/** Nombre de jours dans un mois (month: 0-11). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Le contrat est-il prélevé sur ce mois (month: 0-11) ? */
export function isDebitedInMonth(
  c: CalendarContract,
  year: number,
  month: number,
): boolean {
  const anchor = c.anchorMonth ?? 0;
  switch (c.frequency) {
    case "once": {
      if (!c.startDate) return false;
      const date = new Date(c.startDate);
      return date.getFullYear() === year && date.getMonth() === month;
    }
    case "quarterly":
      return (12 + month - anchor) % 3 === 0;
    case "annual":
      return month === anchor;
    default:
      return true; // monthly
  }
}

/** Jour effectif de prélèvement, borné au dernier jour du mois. */
export function effectiveDebitDay(
  c: CalendarContract,
  year: number,
  month: number,
): number {
  return Math.min(c.debitDay, daysInMonth(year, month));
}

/** Regroupe les prélèvements du mois par jour. */
export function getMonthDebits(
  contracts: CalendarContract[],
  year: number,
  month: number,
): Map<number, DayDebit> {
  const map = new Map<number, DayDebit>();
  for (const c of contracts) {
    if (!isDebitedInMonth(c, year, month)) continue;
    const day = effectiveDebitDay(c, year, month);
    const entry = map.get(day) ?? { day, contracts: [], total: 0 };
    entry.contracts.push(c);
    entry.total += c.amount;
    map.set(day, entry);
  }
  return map;
}

/** Total prélevé sur le mois. */
export function getMonthTotal(
  contracts: CalendarContract[],
  year: number,
  month: number,
): number {
  return contracts
    .filter((c) => isDebitedInMonth(c, year, month))
    .reduce((sum, c) => sum + c.amount, 0);
}

/** Une occurrence de prélèvement : un contrat à une date précise. */
export interface Occurrence {
  date: Date;
  contract: CalendarContract;
}

/**
 * Déplie les contrats en occurrences datées sur un horizon de N mois.
 * Les occurrences antérieures à `from` sont écartées : le mois en cours
 * n'apparaît qu'à partir d'aujourd'hui.
 */
export function getUpcomingDebits(
  contracts: CalendarContract[],
  from: Date,
  months: number,
): Occurrence[] {
  const out: Occurrence[] = [];
  for (let i = 0; i < months; i++) {
    const cursor = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    for (const contract of contracts) {
      if (!isDebitedInMonth(contract, year, month)) continue;
      const date = new Date(year, month, effectiveDebitDay(contract, year, month));
      if (date < from) continue;
      out.push({ date, contract });
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Occurrences d'un mois donné, du 1er au dernier jour. */
export function getMonthOccurrences(
  contracts: CalendarContract[],
  year: number,
  month: number,
): Occurrence[] {
  return contracts
    .filter((c) => isDebitedInMonth(c, year, month))
    .map((contract) => ({
      date: new Date(year, month, effectiveDebitDay(contract, year, month)),
      contract,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Première occurrence à partir de `from`, sans limite d'horizon (24 mois max).
 * Sert aux états vides : distinguer « aucune échéance sur la période »
 * de « plus aucune échéance du tout ».
 */
export function getNextOccurrence(
  contract: CalendarContract,
  from: Date,
): Date | null {
  for (let i = 0; i < 24; i++) {
    const cursor = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    if (!isDebitedInMonth(contract, year, month)) continue;
    const date = new Date(year, month, effectiveDebitDay(contract, year, month));
    if (date >= from) return date;
  }
  return null;
}

/** Groupe des occurrences par mois, dans l'ordre chronologique. */
export interface MonthGroup {
  year: number;
  month: number;
  items: Occurrence[];
  total: number;
}

export function groupByMonth(occurrences: Occurrence[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const occurrence of occurrences) {
    const year = occurrence.date.getFullYear();
    const month = occurrence.date.getMonth();
    const key = `${year}-${month}`;
    const group = groups.get(key) ?? { year, month, items: [], total: 0 };
    group.items.push(occurrence);
    group.total += occurrence.contract.amount;
    groups.set(key, group);
  }
  return [...groups.values()];
}

/** Occurrences d'un même jour, dans l'ordre chronologique. */
export interface DayGroup {
  date: Date;
  items: Occurrence[];
  total: number;
}

export function groupByDay(occurrences: Occurrence[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const occurrence of occurrences) {
    const { date } = occurrence;
    const key = date.toDateString();
    const group = groups.get(key) ?? { date, items: [], total: 0 };
    group.items.push(occurrence);
    group.total += occurrence.contract.amount;
    groups.set(key, group);
  }
  return [...groups.values()];
}

/**
 * Mois de référence (0-11) d'un trimestriel ou d'un annuel ; null sinon.
 * Un contrat qui en a déjà un le garde : sans cela, modifier un montant
 * déplacerait ses prélèvements sur le mois de la modification. À défaut,
 * c'est le mois en cours, comme à la création.
 */
export function resolveAnchorMonth(
  frequency: string,
  previous: number | null,
  today: Date,
): number | null {
  if (frequency !== "quarterly" && frequency !== "annual") return null;
  return previous ?? today.getMonth();
}

/**
 * Mois prélevés (0-11, dans l'ordre de l'année) d'un trimestriel ou d'un
 * annuel ; vide sinon. Sans ancre, janvier, comme isDebitedInMonth.
 */
export function debitMonths(frequency: string, anchor: number | null): number[] {
  const a = anchor ?? 0;
  if (frequency === "annual") return [a];
  if (frequency === "quarterly") return [0, 3, 6, 9].map((k) => (a + k) % 12).sort((x, y) => x - y);
  return [];
}

/** Coût ramené au mois, pour comparer des contrats de fréquences différentes. */
export function monthlyCost(contract: CalendarContract): number {
  switch (contract.frequency) {
    case "monthly":
      return contract.amount;
    case "quarterly":
      return contract.amount / 3;
    case "annual":
      return contract.amount / 12;
    default:
      return 0;
  }
}

/** « Aujourd'hui », « Demain », « Dans 5 jours », « Il y a 2 jours ». */
export function relativeDay(date: Date, today: Date): string {
  const days = Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86_400_000,
  );
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Demain";
  if (days === -1) return "Hier";
  return days > 0 ? `Dans ${days} jours` : `Il y a ${-days} jours`;
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
