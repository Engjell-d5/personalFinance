export type TransactionType = "income" | "expense";
export type Scope = "personal" | "business";
export type AssetCategory =
  | "real_estate"
  | "business"
  | "investment"
  | "vehicle"
  | "equipment"
  | "other";
export type PropertyStatus = "occupied" | "vacant" | "maintenance";
export type InvestmentType = "stock" | "etf" | "crypto" | "bond" | "gold" | "other";
export type MaintenanceStatus = "pending" | "in_progress" | "completed";
export type AccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "cash"
  | "other";
export type RecurrenceFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  scope: Scope;
  categoryId: string;
  description: string;
  accountId?: string;
  assetId?: string;
  propertyId?: string;
  transferId?: string;
  recurringRuleId?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface RecurringRule {
  id: string;
  amount: number;
  type: TransactionType;
  scope: Scope;
  categoryId: string;
  description: string;
  assetId?: string;
  propertyId?: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive: boolean;
  lastGeneratedDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: TransactionType;
  scope: Scope;
  parentId?: string;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  scope: Scope;

  // Common
  purchasePrice?: number;
  currentValue?: number;
  purchaseDate?: string;
  description?: string;
  notes?: string;

  // Real estate
  address?: string;
  monthlyMortgage?: number;
  propertyStatus?: PropertyStatus;

  // Investment
  symbol?: string;
  investmentType?: InvestmentType;
  units?: number;
  currentPrice?: number;

  // Depreciation (vehicles, equipment)
  depreciationRate?: number;

  // Business
  businessType?: string;
  ownershipPercentage?: number;
  linkedAccountId?: string;
  valuationMethod?: "manual" | "profit_multiple" | "revenue_multiple";
  valuationMultiple?: number;
  annualRevenue?: number;
  annualProfit?: number;

  // Metadata
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Tenant {
  id: string;
  assetId: string;
  name: string;
  email?: string;
  phone?: string;
  leaseStart: string;
  leaseEnd?: string;
  monthlyRent: number;
  depositAmount?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  date: string;
  description: string;
  cost: number;
  vendor?: string;
  status: MaintenanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution?: string;
  startingBalance: number;
  currency: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type BudgetPeriod = "monthly" | "yearly";

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  scope?: Scope;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface SyncMeta {
  id: string;
  lastSyncTimestamp: string;
  driveFileId?: string;
  lastRemoteHash?: string;
  conflictsResolved: number;
}
