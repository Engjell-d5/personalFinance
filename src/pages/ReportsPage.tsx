import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonthlyReport } from "@/components/reports/MonthlyReport";
import { CategoryAnalysis } from "@/components/reports/CategoryAnalysis";
import { TrendChart } from "@/components/reports/TrendChart";
import { ExportButton } from "@/components/reports/ExportButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";

const MONTHS = [
  { value: "0", label: "January" },
  { value: "1", label: "February" },
  { value: "2", label: "March" },
  { value: "3", label: "April" },
  { value: "4", label: "May" },
  { value: "5", label: "June" },
  { value: "6", label: "July" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "October" },
  { value: "10", label: "November" },
  { value: "11", label: "December" },
];

function getYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const years: { value: string; label: string }[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

export function ReportsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const yearOptions = useMemo(() => getYearOptions(), []);

  const { startDate, endDate } = useMemo(() => {
    const date = new Date(Number(selectedYear), Number(selectedMonth), 1);
    const start = format(startOfMonth(date), "yyyy-MM-dd");
    const end = format(endOfMonth(date), "yyyy-MM-dd");
    return { startDate: start, endDate: end };
  }, [selectedMonth, selectedYear]);

  const { transactions } = useTransactions({ startDate, endDate });
  const expenseCategories = useCategories("expense");
  const incomeCategories = useCategories("income");

  const allCategories = useMemo(
    () => [...expenseCategories, ...incomeCategories],
    [expenseCategories, incomeCategories]
  );

  // For TrendChart we need all transactions (last 12 months), not just selected month
  const { transactions: allTransactions } = useTransactions({});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Monthly and yearly breakdowns, trends, and category analysis.
          </p>
        </div>
        <ExportButton transactions={transactions} categories={allCategories} />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-35">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-25">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y.value} value={y.value}>
                {y.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MonthlyReport
            transactions={transactions}
            categories={allCategories}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryAnalysis
            transactions={transactions}
            categories={allCategories}
          />
        </TabsContent>

        <TabsContent value="trends">
          <TrendChart transactions={allTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
