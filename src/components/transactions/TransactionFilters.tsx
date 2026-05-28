import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import type { Category, Scope } from "@/lib/types";
import { Search } from "lucide-react";

interface TransactionFiltersProps {
  scope: Scope | "all";
  onScopeChange: (scope: Scope | "all") => void;
  accountId: string;
  onAccountChange: (accountId: string) => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categories: Category[];
  period: string;
  onPeriodChange: (period: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getPeriodOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const options: { value: string; label: string }[] = [
    { value: "all", label: "All Time" },
    { value: `month:${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`, label: "This Month" },
    { value: `year:${currentYear}`, label: "This Year" },
  ];

  for (let i = 1; i <= 11; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m < 0) { m += 12; y -= 1; }
    options.push({
      value: `month:${y}-${String(m + 1).padStart(2, "0")}`,
      label: `${MONTHS[m]} ${y}`,
    });
  }

  for (let i = 1; i <= 3; i++) {
    options.push({
      value: `year:${currentYear - i}`,
      label: `Year ${currentYear - i}`,
    });
  }

  return options;
}

export function TransactionFilters({
  scope,
  onScopeChange,
  accountId,
  onAccountChange,
  categoryId,
  onCategoryChange,
  categories,
  period,
  onPeriodChange,
  search,
  onSearchChange,
}: TransactionFiltersProps) {
  const { accounts } = useAccounts();
  const periodOptions = getPeriodOptions();

  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={scope} onValueChange={(v) => onScopeChange(v as Scope | "all")}>
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Scopes</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="business">Business</SelectItem>
        </SelectContent>
      </Select>
      {accounts.length > 1 && (
        <Select value={accountId} onValueChange={onAccountChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {categories.length > 0 && (
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
