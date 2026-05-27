import type { Category } from "./types";

export const CURRENCY = "EUR";
export const CURRENCY_SYMBOL = "€";
export const LOCALE = "de-DE";

export const DEFAULT_CATEGORIES: Omit<Category, "createdAt">[] = [
  // Personal Expenses
  { id: "cat-groceries", name: "Groceries", icon: "ShoppingCart", color: "#22c55e", type: "expense", scope: "personal", sortOrder: 1, isSystem: true },
  { id: "cat-dining", name: "Dining Out", icon: "UtensilsCrossed", color: "#f97316", type: "expense", scope: "personal", sortOrder: 2, isSystem: true },
  { id: "cat-transport", name: "Transport", icon: "Car", color: "#3b82f6", type: "expense", scope: "personal", sortOrder: 3, isSystem: true },
  { id: "cat-utilities", name: "Utilities", icon: "Zap", color: "#eab308", type: "expense", scope: "personal", sortOrder: 4, isSystem: true },
  { id: "cat-healthcare", name: "Healthcare", icon: "Heart", color: "#ef4444", type: "expense", scope: "personal", sortOrder: 5, isSystem: true },
  { id: "cat-entertainment", name: "Entertainment", icon: "Tv", color: "#8b5cf6", type: "expense", scope: "personal", sortOrder: 6, isSystem: true },
  { id: "cat-clothing", name: "Clothing", icon: "Shirt", color: "#ec4899", type: "expense", scope: "personal", sortOrder: 7, isSystem: true },
  { id: "cat-insurance", name: "Insurance", icon: "Shield", color: "#06b6d4", type: "expense", scope: "personal", sortOrder: 8, isSystem: true },
  { id: "cat-subscriptions", name: "Subscriptions", icon: "CreditCard", color: "#6366f1", type: "expense", scope: "personal", sortOrder: 9, isSystem: true },
  { id: "cat-education", name: "Education", icon: "GraduationCap", color: "#0ea5e9", type: "expense", scope: "personal", sortOrder: 10, isSystem: true },
  { id: "cat-personal-other", name: "Other", icon: "MoreHorizontal", color: "#737373", type: "expense", scope: "personal", sortOrder: 11, isSystem: true },

  // Business Expenses
  { id: "cat-biz-office", name: "Office", icon: "Building2", color: "#3b82f6", type: "expense", scope: "business", sortOrder: 1, isSystem: true },
  { id: "cat-biz-supplies", name: "Supplies", icon: "Package", color: "#22c55e", type: "expense", scope: "business", sortOrder: 2, isSystem: true },
  { id: "cat-biz-travel", name: "Business Travel", icon: "Plane", color: "#06b6d4", type: "expense", scope: "business", sortOrder: 3, isSystem: true },
  { id: "cat-biz-software", name: "Software & Tools", icon: "Monitor", color: "#8b5cf6", type: "expense", scope: "business", sortOrder: 4, isSystem: true },
  { id: "cat-biz-marketing", name: "Marketing", icon: "Megaphone", color: "#f97316", type: "expense", scope: "business", sortOrder: 5, isSystem: true },
  { id: "cat-biz-legal", name: "Legal & Accounting", icon: "Scale", color: "#eab308", type: "expense", scope: "business", sortOrder: 6, isSystem: true },
  { id: "cat-biz-salary", name: "Owner's Salary", icon: "Banknote", color: "#22c55e", type: "expense", scope: "business", sortOrder: 7, isSystem: true },
  { id: "cat-biz-draw", name: "Owner's Draw", icon: "ArrowRightLeft", color: "#8b5cf6", type: "expense", scope: "business", sortOrder: 8, isSystem: true },
  { id: "cat-biz-other", name: "Other Business", icon: "MoreHorizontal", color: "#737373", type: "expense", scope: "business", sortOrder: 9, isSystem: true },

  // Property Expenses
  { id: "cat-prop-purchase", name: "Property Purchase", icon: "Home", color: "#0f172a", type: "expense", scope: "personal", sortOrder: 19, isSystem: true },
  { id: "cat-prop-mortgage", name: "Mortgage", icon: "Home", color: "#3b82f6", type: "expense", scope: "personal", sortOrder: 20, isSystem: true },
  { id: "cat-prop-maintenance", name: "Property Maintenance", icon: "Wrench", color: "#f97316", type: "expense", scope: "personal", sortOrder: 21, isSystem: true },
  { id: "cat-prop-tax", name: "Property Tax", icon: "Receipt", color: "#ef4444", type: "expense", scope: "personal", sortOrder: 22, isSystem: true },
  { id: "cat-prop-insurance", name: "Property Insurance", icon: "ShieldCheck", color: "#06b6d4", type: "expense", scope: "personal", sortOrder: 23, isSystem: true },

  // Personal Income
  { id: "cat-salary", name: "Salary", icon: "Banknote", color: "#22c55e", type: "income", scope: "personal", sortOrder: 1, isSystem: true },
  { id: "cat-rental-income", name: "Rental Income", icon: "Home", color: "#3b82f6", type: "income", scope: "personal", sortOrder: 2, isSystem: true },
  { id: "cat-investment-income", name: "Investment Returns", icon: "TrendingUp", color: "#8b5cf6", type: "income", scope: "personal", sortOrder: 3, isSystem: true },
  { id: "cat-freelance", name: "Freelance", icon: "Briefcase", color: "#f97316", type: "income", scope: "personal", sortOrder: 4, isSystem: true },
  { id: "cat-personal-income-other", name: "Other Income", icon: "MoreHorizontal", color: "#737373", type: "income", scope: "personal", sortOrder: 5, isSystem: true },

  // Business Income
  { id: "cat-biz-revenue", name: "Business Revenue", icon: "DollarSign", color: "#22c55e", type: "income", scope: "business", sortOrder: 1, isSystem: true },
  { id: "cat-biz-consulting", name: "Consulting", icon: "Users", color: "#3b82f6", type: "income", scope: "business", sortOrder: 2, isSystem: true },
  { id: "cat-biz-income-other", name: "Other Business Income", icon: "MoreHorizontal", color: "#737373", type: "income", scope: "business", sortOrder: 3, isSystem: true },
];
