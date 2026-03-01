export type Contract = {
  id: string;
  name: string;
  provider: string;
  contractNumber: string;
  category: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  renewalDate: Date | null;
  monthlyAmount: number | null;
  annualAmount: number | null;
  clientPhone: string | null;
  website: string | null;
  advisorName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// build form data interface based on Contract but with all fields optional except name and startDate
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

// export type ContractCategory =
//   | "Insurance"
//   | "Subscription"
//   | "Loan"
//   | "Service"
//   | "Other";

export type ContractProvider =
  | "Netflix"
  | "Spotify"
  | "Amazon"
  | "Apple"
  | "Google"
  | "Microsoft"
  | "Other";

// export interface ContractFormData {
//   name: string;
//   provider?: string;
//   contractNumber?: string;
//   category?: string;
//   status?: string;
//   startDate: string;
//   endDate?: string;
//   renewalDate?: string;
//   monthlyAmount?: string;
//   annualAmount?: string;
//   clientPhone?: string;
//   website?: string;
//   advisorName?: string;
//   notes?: string;
// }

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
