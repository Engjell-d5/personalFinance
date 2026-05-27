import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Budget, BudgetPeriod } from "@/lib/types";

export function BudgetsPage() {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
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

  const [filter, setFilter] = useState<"all" | BudgetPeriod>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const filteredBudgets = useMemo(() => {
    if (filter === "all") return budgets;
    return budgets.filter((b) => b.period === filter);
  }, [budgets, filter]);

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

  const existingCategoryIds = budgets.map((b) => b.categoryId);

  const summary = useMemo(() => {
    let totalBudgeted = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;

    for (const budget of budgets) {
      totalBudgeted += budget.amount;
      const spent = getSpent(budget);
      totalSpent += spent;
      if (spent > budget.amount) overBudgetCount++;
    }

    return { totalBudgeted, totalSpent, overBudgetCount };
  }, [budgets, monthlyTransactions, yearlyTransactions]);

  function handleAdd(data: {
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
    scope?: "personal" | "business";
  }) {
    addBudget(data);
  }

  function handleEdit(data: {
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
    scope?: "personal" | "business";
  }) {
    if (!editingBudget) return;
    updateBudget(editingBudget.id, data);
    setEditingBudget(undefined);
  }

  function handleDelete(budget: Budget) {
    if (!confirm(`Delete budget for this category?`)) return;
    deleteBudget(budget.id);
  }

  function openEdit(budget: Budget) {
    setEditingBudget(budget);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingBudget(undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Budget
        </Button>
      </div>

      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Budgeted</p>
              <p className="text-lg font-semibold">
                {formatCurrency(summary.totalBudgeted)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-lg font-semibold">
                {formatCurrency(summary.totalSpent)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Over Budget</p>
              <p
                className={cn(
                  "text-lg font-semibold",
                  summary.overBudgetCount > 0
                    ? "text-red-600 dark:text-red-400"
                    : ""
                )}
              >
                {summary.overBudgetCount}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as "all" | BudgetPeriod)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredBudgets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No budgets yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a budget to start tracking your spending.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets.map((budget) => {
            const category = categoryMap.get(budget.categoryId);
            if (!category) return null;
            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                category={category}
                spent={getSpent(budget)}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={editingBudget ? handleEdit : handleAdd}
        initial={editingBudget}
        existingCategoryIds={existingCategoryIds}
      />
    </div>
  );
}
