import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import type { Scope } from "@/lib/types";
import { Search } from "lucide-react";

interface TransactionFiltersProps {
  scope: Scope | "all";
  onScopeChange: (scope: Scope | "all") => void;
  accountId: string;
  onAccountChange: (accountId: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function TransactionFilters({
  scope,
  onScopeChange,
  accountId,
  onAccountChange,
  search,
  onSearchChange,
}: TransactionFiltersProps) {
  const { accounts } = useAccounts();

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
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
    </div>
  );
}
