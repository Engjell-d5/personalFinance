import { useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/format";
import type { Asset } from "@/lib/types";

interface BusinessDetailProps {
  asset: Asset;
}

export function BusinessDetail({ asset }: BusinessDetailProps) {
  const { transactions: allTx } = useTransactions({ assetId: asset.id });
  const expenseCategories = useCategories("expense");
  const incomeCategories = useCategories("income");

  const allCategories = useMemo(
    () => [...expenseCategories, ...incomeCategories],
    [expenseCategories, incomeCategories]
  );
  const categoryMap = useMemo(
    () => new Map(allCategories.map((c) => [c.id, c])),
    [allCategories]
  );

  const { revenue, expenses, profit, computedValue, revenueByCategory, expenseByCategory } =
    useMemo(() => {
      const rev = allTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const exp = allTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);

      const revByCat = new Map<string, number>();
      const expByCat = new Map<string, number>();

      for (const t of allTx) {
        const map = t.type === "income" ? revByCat : expByCat;
        map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
      }

      const method = asset.valuationMethod ?? "manual";
      const multiple = asset.valuationMultiple ?? 3;
      let computedValue: number | null = null;
      if (method === "revenue_multiple") {
        computedValue = (asset.annualRevenue ?? 0) * multiple;
      } else if (method === "profit_multiple") {
        computedValue = (asset.annualProfit ?? 0) * multiple;
      }

      return {
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
        computedValue,
        revenueByCategory: Array.from(revByCat.entries())
          .map(([id, amount]) => ({
            id,
            name: categoryMap.get(id)?.name ?? "Unknown",
            amount,
          }))
          .sort((a, b) => b.amount - a.amount),
        expenseByCategory: Array.from(expByCat.entries())
          .map(([id, amount]) => ({
            id,
            name: categoryMap.get(id)?.name ?? "Unknown",
            amount,
          }))
          .sort((a, b) => b.amount - a.amount),
      };
    }, [allTx, categoryMap]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valuation
              {(asset.valuationMethod ?? "manual") !== "manual" && (
                <span className="ml-1 text-[10px] font-normal">
                  ({asset.valuationMethod === "revenue_multiple" ? "Revenue" : "Profit"} × {asset.valuationMultiple ?? 3})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(computedValue ?? asset.currentValue ?? 0)}
            </p>
            {asset.ownershipPercentage != null && asset.ownershipPercentage < 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                Your share ({asset.ownershipPercentage}%):{" "}
                {formatCurrency((computedValue ?? asset.currentValue ?? 0) * asset.ownershipPercentage / 100)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {asset.ownershipPercentage ?? 100}%
            </p>
          </CardContent>
        </Card>
        {asset.businessType && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Business Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {asset.businessType}
              </Badge>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold tabular-nums ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {profit >= 0 ? "+" : ""}
              {formatCurrency(profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">P&L</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(revenue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(expenses)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Net Profit
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-lg font-bold ${profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {profit >= 0 ? "+" : ""}
                  {formatCurrency(profit)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No income transactions linked to this business.
                </p>
              ) : (
                <div className="space-y-3">
                  {revenueByCategory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium tabular-nums text-green-600 dark:text-green-400">
                        +{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No expense transactions linked to this business.
                </p>
              ) : (
                <div className="space-y-3">
                  {expenseByCategory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium tabular-nums">
                        -{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
