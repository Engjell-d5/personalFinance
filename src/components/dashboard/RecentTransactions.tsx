import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction, Category } from "@/lib/types";
import { ArrowRight } from "lucide-react";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
}

export function RecentTransactions({
  transactions,
  categories,
}: RecentTransactionsProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium">
          Recent Transactions
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link to="/expenses">
            View all <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No transactions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => {
              const cat = categoryMap.get(t.categoryId);
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat?.color ?? "#737373" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat?.name ?? "Unknown"} · {formatDateShort(t.date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums whitespace-nowrap",
                      t.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    )}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
