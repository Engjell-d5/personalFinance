import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/format";
import type { Transaction, Scope } from "@/lib/types";

function getDateRange(period: string): { startDate?: string; endDate?: string } {
  if (period === "all") return {};
  if (period.startsWith("month:")) {
    const ym = period.slice(6);
    const [year, month] = ym.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year!, month!, 0).getDate();
    const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { startDate: start, endDate: end };
  }
  if (period.startsWith("year:")) {
    const year = period.slice(5);
    return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
  }
  return {};
}

function defaultPeriod(): string {
  const now = new Date();
  return `month:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function IncomePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [scopeFilter, setScopeFilter] = useState<Scope | "all">("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState(defaultPeriod());
  const [search, setSearch] = useState("");

  const dateRange = useMemo(() => getDateRange(periodFilter), [periodFilter]);

  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions({
      type: "income",
      scope: scopeFilter === "all" ? undefined : scopeFilter,
      accountId: accountFilter === "all" ? undefined : accountFilter,
      categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      search: search || undefined,
    });

  const categories = useCategories("income");

  function handleEdit(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditing(undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Income</h1>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Income
        </Button>
      </div>

      <TransactionFilters
        scope={scopeFilter}
        onScopeChange={setScopeFilter}
        accountId={accountFilter}
        onAccountChange={setAccountFilter}
        categoryId={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        period={periodFilter}
        onPeriodChange={setPeriodFilter}
        search={search}
        onSearchChange={setSearch}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{transactions.length} entr{transactions.length !== 1 ? "ies" : "y"}</span>
            <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">
              {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactions}
            categories={categories}
            onEdit={handleEdit}
            onDelete={deleteTransaction}
          />
        </CardContent>
      </Card>

      <TransactionForm
        open={formOpen}
        onClose={handleClose}
        defaultType="income"
        initial={editing}
        onSubmit={async (data) => {
          if (editing) {
            await updateTransaction(editing.id, data);
          } else {
            await addTransaction(data);
          }
        }}
      />
    </div>
  );
}
