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

export function IncomePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [scopeFilter, setScopeFilter] = useState<Scope | "all">("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions({
      type: "income",
      scope: scopeFilter === "all" ? undefined : scopeFilter,
      accountId: accountFilter === "all" ? undefined : accountFilter,
      categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      search: search || undefined,
    });

  const categories = useCategories("income");

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return transactions
      .filter((t) => t.date.startsWith(monthPrefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            This month:{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(totalThisMonth)}
            </span>
          </p>
        </div>
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
