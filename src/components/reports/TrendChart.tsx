import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import type { Transaction } from "@/lib/types";

interface TrendChartProps {
  transactions: Transaction[];
}

interface MonthData {
  month: string;
  income: number;
  expenses: number;
}

export function TrendChart({ transactions }: TrendChartProps) {
  const data: MonthData[] = useMemo(() => {
    const now = new Date();
    const months: MonthData[] = [];

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const label = format(monthDate, "MMM yyyy");

      let income = 0;
      let expenses = 0;

      for (const t of transactions) {
        const txDate = new Date(t.date);
        if (isWithinInterval(txDate, { start, end })) {
          if (t.type === "income") {
            income += t.amount;
          } else {
            expenses += t.amount;
          }
        }
      }

      months.push({ month: label, income, expenses });
    }

    return months;
  }, [transactions]);

  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No transaction data available for trend analysis.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Income vs Expenses (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatCurrency(value)}
                width={80}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  String(name) === "income" ? "Income" : "Expenses",
                ]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend
                formatter={(value: string) =>
                  value === "income" ? "Income" : "Expenses"
                }
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
