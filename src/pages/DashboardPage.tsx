import { useDashboard } from "@/hooks/useDashboard";
import { useCategories } from "@/hooks/useCategories";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { CashFlowCard } from "@/components/dashboard/CashFlowCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickActions } from "@/components/dashboard/QuickActions";

export function DashboardPage() {
  const data = useDashboard();
  const expenseCategories = useCategories("expense");
  const incomeCategories = useCategories("income");
  const allCategories = [...expenseCategories, ...incomeCategories];

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NetWorthCard
          netWorth={data.netWorth}
          cashBalance={data.cashBalance}
          realEstateValue={data.realEstateValue}
          investmentValue={data.investmentValue}
          businessValue={data.businessValue}
          otherAssetValue={data.otherAssetValue}
          accountBalances={data.accountBalances}
        />
        <CashFlowCard
          monthIncome={data.monthIncome}
          monthExpenses={data.monthExpenses}
          monthCashFlow={data.monthCashFlow}
          monthlyTrend={data.monthlyTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={data.recentTransactions}
            categories={allCategories}
          />
        </div>
        <QuickActions />
      </div>
    </div>
  );
}
