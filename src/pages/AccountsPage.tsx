import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountCard } from "@/components/accounts/AccountCard";
import { AccountForm } from "@/components/accounts/AccountForm";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/format";
import type { Account } from "@/lib/types";
import { DollarSign, Wallet } from "lucide-react";

export function AccountsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>();
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { transactions } = useTransactions({});

  const accountBalances = useMemo(() => {
    const balanceMap = new Map<string, number>();
    for (const account of accounts) {
      const accTx = transactions.filter((t) => t.accountId === account.id);
      const income = accTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expenses = accTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      balanceMap.set(account.id, account.startingBalance + income - expenses);
    }
    return balanceMap;
  }, [accounts, transactions]);

  const totalBalance = useMemo(() => {
    let total = 0;
    for (const balance of accountBalances.values()) {
      total += balance;
    }
    return total;
  }, [accountBalances]);

  function handleEdit(account: Account) {
    setEditing(account);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditing(undefined);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Accounts
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{accounts.length}</div>
          </CardContent>
        </Card>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">No accounts yet.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Add your bank accounts, credit cards, and cash accounts to track balances.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              balance={accountBalances.get(account.id) ?? account.startingBalance}
              onEdit={handleEdit}
              onDelete={deleteAccount}
            />
          ))}
        </div>
      )}

      <AccountForm
        open={formOpen}
        onClose={handleClose}
        initial={editing}
        onSubmit={async (data) => {
          if (editing) {
            await updateAccount(editing.id, data);
          } else {
            await addAccount(data);
          }
        }}
      />
    </div>
  );
}
