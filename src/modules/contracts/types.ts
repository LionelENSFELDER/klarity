export type Contract = {
  id: string;
  name: string;
  provider: string;
  contractNumber: string | null;
  category: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  renewalDate: Date | null;
  amount: number;
  frequency: string;
  debitDay: number;
  anchorMonth: number | null;
  documentUrl: string | null;
  documentName: string | null;
  monthlyAmount: number | null;
  annualAmount: number | null;
  clientPhone: string | null;
  website: string | null;
  advisorName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ContractFormData = Omit<
  Contract,
  "id" | "createdAt" | "updatedAt"
> & {};

export interface ContractStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  archived: number;
}

export type ContractStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PENDING"
  | "EXPIRED"
  | "ARCHIVED";

export type ContractProvider =
  | "Netflix"
  | "Spotify"
  | "Amazon"
  | "Apple"
  | "Google"
  | "Microsoft"
  | "Other";

export interface ContractCreateData {
  userId: string;
  name: string;
  provider?: string;
  contractNumber?: string;
  category?: string;
  status?: ContractStatus;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  monthlyAmount?: number;
  annualAmount?: number;
  clientPhone?: string;
  website?: string;
  advisorName?: string;
  notes?: string;
}

export interface ContractUpdateData {
  name?: string;
  provider?: string;
  contractNumber?: string;
  category?: string;
  status?: ContractStatus;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  monthlyAmount?: number;
  annualAmount?: number;
  clientPhone?: string;
  website?: string;
  advisorName?: string;
  notes?: string;
}

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
