import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction, Category } from "@/lib/types";

interface MonthlyReportProps {
  transactions: Transaction[];
  categories: Category[];
}

export function MonthlyReport({ transactions, categories }: MonthlyReportProps) {
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  const { totalIncome, totalExpenses, net } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    }
    return { totalIncome: income, totalExpenses: expenses, net: income - expenses };
  }, [transactions]);

  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    const sorted = [...transactions].sort(
      (a, b) => b.date.localeCompare(a.date)
    );
    for (const t of sorted) {
      const existing = groups.get(t.date);
      if (existing) {
        existing.push(t);
      } else {
        groups.set(t.date, [t]);
      }
    }
    return groups;
  }, [transactions]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {net > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : net < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-2xl font-bold",
                  net > 0 && "text-green-600",
                  net < 0 && "text-red-600"
                )}
              >
                {formatCurrency(net)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Transactions Table Grouped by Date */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No transactions found for this period.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(groupedByDate.entries()).map(([date, txns]) =>
                  txns.map((t, idx) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {idx === 0 ? formatDate(date) : ""}
                      </TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {categoryMap.get(t.categoryId)?.name ?? "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium tabular-nums",
                          t.type === "income" && "text-green-600"
                        )}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
