import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Transaction, Category } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">No transactions yet.</p>
        <p className="text-muted-foreground text-xs mt-1">
          Click the button above to add your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => {
        const category = categoryMap.get(t.categoryId);
        return (
          <div
            key={t.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: category?.color ?? "#737373" }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {t.description}
                </span>
                <Badge
                  variant={t.scope === "business" ? "default" : "secondary"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {t.scope}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {category?.name ?? "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {formatDate(t.date)}
                </span>
              </div>
            </div>

            <span
              className={cn(
                "text-sm font-semibold tabular-nums whitespace-nowrap",
                t.type === "income" ? "text-green-600 dark:text-green-400" : "text-foreground"
              )}
            >
              {t.type === "income" ? "+" : "-"}
              {formatCurrency(t.amount)}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onEdit(t)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => onDelete(t.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
