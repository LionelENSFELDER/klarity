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
  documentUrl: string | null;
  documentName: string | null;
  iconType?: string | null;
  iconValue?: string | null;
}

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
