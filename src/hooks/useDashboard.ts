import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/index";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

function toDateStr(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function useDashboard() {
  return useLiveQuery(async () => {
    const now = new Date();
    const monthStart = toDateStr(startOfMonth(now));
    const monthEnd = toDateStr(endOfMonth(now));

    const allTx = await db.transactions.toArray();
    const activeTx = allTx.filter((t) => !t.deletedAt);

    const monthTx = activeTx.filter(
      (t) => t.date >= monthStart && t.date <= monthEnd
    );

    const monthIncome = monthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const monthExpenses = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const totalIncome = activeTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = activeTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    // Accounts
    const accounts = (await db.accounts.toArray()).filter((a) => !a.deletedAt);
    const accountBalances = accounts.map((acc) => {
      const accTx = activeTx.filter((t) => t.accountId === acc.id);
      const accIncome = accTx
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const accExpenses = accTx
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return { ...acc, balance: acc.startingBalance + accIncome - accExpenses };
    });

    const cashBalance =
      accounts.length > 0
        ? accountBalances.reduce((s, a) => s + a.balance, 0)
        : totalIncome - totalExpenses;

    // Assets — unified
    const allAssets = (await db.assets.toArray()).filter((a) => !a.deletedAt);

    const realEstateValue = allAssets
      .filter((a) => a.category === "real_estate")
      .reduce((s, a) => s + (a.currentValue ?? 0), 0);

    const investmentValue = allAssets
      .filter((a) => a.category === "investment")
      .reduce((s, a) => {
        if (a.units && a.currentPrice) return s + a.units * a.currentPrice;
        return s + (a.currentValue ?? 0);
      }, 0);

    const businessValue = allAssets
      .filter((a) => a.category === "business")
      .reduce((s, a) => {
        const ownership = (a.ownershipPercentage ?? 100) / 100;
        const method = a.valuationMethod ?? "manual";
        const multiple = a.valuationMultiple ?? 3;

        let value: number;
        if (method === "revenue_multiple") {
          value = (a.annualRevenue ?? 0) * multiple;
        } else if (method === "profit_multiple") {
          value = (a.annualProfit ?? 0) * multiple;
        } else {
          value = a.currentValue ?? 0;
        }

        return s + value * ownership;
      }, 0);

    const otherAssetValue = allAssets
      .filter((a) =>
        ["vehicle", "equipment", "other"].includes(a.category)
      )
      .reduce((s, a) => s + (a.currentValue ?? 0), 0);

    const totalAssetValue =
      realEstateValue + investmentValue + businessValue + otherAssetValue;

    const netWorth = cashBalance + totalAssetValue;

    const recentTransactions = activeTx
      .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
      .slice(0, 10);

    const monthlyTrend: { month: string; income: number; expenses: number }[] =
      [];
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const mStart = toDateStr(startOfMonth(m));
      const mEnd = toDateStr(endOfMonth(m));
      const mTx = activeTx.filter((t) => t.date >= mStart && t.date <= mEnd);
      monthlyTrend.push({
        month: format(m, "MMM"),
        income: mTx
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + t.amount, 0),
        expenses: mTx
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + t.amount, 0),
      });
    }

    return {
      netWorth,
      cashBalance,
      realEstateValue,
      investmentValue,
      businessValue,
      otherAssetValue,
      totalAssetValue,
      monthIncome,
      monthExpenses,
      monthCashFlow: monthIncome - monthExpenses,
      recentTransactions,
      monthlyTrend,
      accountBalances,
    };
  });
}
