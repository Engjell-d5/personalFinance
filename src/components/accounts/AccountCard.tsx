import { Trash2, Pencil, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Account } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  balance: number;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
  other: "Other",
};

const typeColors: Record<string, string> = {
  checking: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  savings: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  credit_card: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  cash: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function AccountCard({ account, balance, onEdit, onDelete }: AccountCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{account.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] px-1.5 py-0 border-0", typeColors[account.type])}
                >
                  {typeLabels[account.type]}
                </Badge>
              </div>
              {account.institution && (
                <p className="text-xs text-muted-foreground mt-1">
                  {account.institution}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(account)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(account.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p
              className={cn(
                "text-sm font-medium tabular-nums",
                balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {formatCurrency(balance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Starting Balance</p>
            <p className="text-sm font-medium tabular-nums">
              {formatCurrency(account.startingBalance)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
