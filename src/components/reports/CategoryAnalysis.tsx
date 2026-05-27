import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction, Category } from "@/lib/types";

interface CategoryAnalysisProps {
  transactions: Transaction[];
  categories: Category[];
}

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export function CategoryAnalysis({
  transactions,
  categories,
}: CategoryAnalysisProps) {
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const cat of categories) {
      map.set(cat.id, cat);
    }
    return map;
  }, [categories]);

  const data: CategoryData[] = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === "expense") {
        totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
      }
    }

    const grandTotal = Array.from(totals.values()).reduce((s, v) => s + v, 0);

    return Array.from(totals.entries())
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId);
        return {
          name: cat?.name ?? "Unknown",
          amount,
          color: cat?.color ?? "#737373",
          percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categoryMap]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No expense data available for this period.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: Math.max(data.length * 48, 200) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar
                  dataKey="amount"
                  radius={[0, 4, 4, 0]}
                  barSize={28}
                  label={{
                    position: "right",
                    formatter: (value) => formatCurrency(Number(value)),
                    fontSize: 12,
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm flex-1">{item.name}</span>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(item.amount)}
                </span>
                <span
                  className={cn(
                    "text-xs text-muted-foreground tabular-nums w-12 text-right"
                  )}
                >
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
