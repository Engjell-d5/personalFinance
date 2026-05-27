import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface CashFlowCardProps {
  monthIncome: number;
  monthExpenses: number;
  monthCashFlow: number;
  monthlyTrend: { month: string; income: number; expenses: number }[];
}

export function CashFlowCard({
  monthIncome,
  monthExpenses,
  monthCashFlow,
  monthlyTrend,
}: CashFlowCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Monthly Cash Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tabular-nums ${monthCashFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {monthCashFlow >= 0 ? "+" : ""}
            {formatCurrency(monthCashFlow)}
          </span>
          <span className="text-xs text-muted-foreground">this month</span>
        </div>

        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <ArrowUpCircle className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-muted-foreground">
              {formatCurrency(monthIncome)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowDownCircle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs text-muted-foreground">
              {formatCurrency(monthExpenses)}
            </span>
          </div>
        </div>

        <div className="h-32 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend} barGap={2}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                }}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
