import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Scope } from "@/lib/types";
import { Search } from "lucide-react";

interface TransactionFiltersProps {
  scope: Scope | "all";
  onScopeChange: (scope: Scope | "all") => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function TransactionFilters({
  scope,
  onScopeChange,
  search,
  onSearchChange,
}: TransactionFiltersProps) {
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
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="personal">Personal</SelectItem>
          <SelectItem value="business">Business</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
