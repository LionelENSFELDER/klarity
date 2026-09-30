import type { CalendarContract } from "./calendar";

export interface statsType {
  activeContracts?: number;
  totalContracts?: number;
  newConstractsThisMonth?: number;
  recentContracts?: CalendarContract[];
  contractsByCategory?: CalendarContract[];
  totalMonthly?: number;
  totalAnnual?: number;
  budgetTarget?: number;
  budgetProgress?: number;
}
