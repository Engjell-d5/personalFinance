import { useMemo } from "react";
import { Link } from "react-router";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { Budget } from "@/lib/types";

export function BudgetOverview() {
  const { budgets } = useBudgets();
  const categories = useCategories("expense");
  const now = new Date();

  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const yearStart = format(startOfYear(now), "yyyy-MM-dd");
  const yearEnd = format(endOfYear(now), "yyyy-MM-dd");

  const { transactions: monthlyTransactions } = useTransactions({
    type: "expense",
    startDate: monthStart,
    endDate: monthEnd,
  });

  const { transactions: yearlyTransactions } = useTransactions({
    type: "expense",
    startDate: yearStart,
    endDate: yearEnd,
  });

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  function getSpent(budget: Budget): number {
    const txns =
      budget.period === "monthly" ? monthlyTransactions : yearlyTransactions;
    return txns
      .filter((t) => {
        if (t.categoryId !== budget.categoryId) return false;
        if (budget.scope && t.scope !== budget.scope) return false;
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  const topBudgets = useMemo(() => {
    if (budgets.length === 0) return [];

    const withSpent = budgets.map((b) => {
      const spent = getSpent(b);
      const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      return { budget: b, spent, percentage };
    });

    withSpent.sort((a, b) => b.percentage - a.percentage);

    return withSpent.slice(0, 4);
  }, [budgets, monthlyTransactions, yearlyTransactions]);

  if (budgets.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link to="/budgets">
            View all budgets <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topBudgets.map(({ budget, spent, percentage }) => {
            const category = categoryMap.get(budget.categoryId);
            if (!category) return null;
            const isOver = percentage > 100;

            return (
              <div key={budget.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: category.color ?? "#737373",
                      }}
                    />
                    <span className="truncate">{category.name}</span>
                  </div>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isOver
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress value={spent} max={budget.amount} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
