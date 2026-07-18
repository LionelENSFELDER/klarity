// Logique de calcul des prélèvements sur un mois donné.

export interface CalendarContract {
  id: string;
  name: string;
  provider: string;
  contractNumber: string | null;
  category: string;
  amount: number;
  frequency: string; // monthly | quarterly | annual
  debitDay: number; // 1-31
  anchorMonth: number | null; // 0-11
  renewalDate: string | null; // ISO
  documentUrl: string | null;
  documentName: string | null;
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
export function isDebitedInMonth(c: CalendarContract, month: number): boolean {
  const anchor = c.anchorMonth ?? 0;
  switch (c.frequency) {
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
    if (!isDebitedInMonth(c, month)) continue;
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
  month: number,
): number {
  return contracts
    .filter((c) => isDebitedInMonth(c, month))
    .reduce((sum, c) => sum + c.amount, 0);
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
