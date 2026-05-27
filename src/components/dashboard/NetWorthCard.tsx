import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Wallet, Home, TrendingUp, Briefcase, Package, Banknote } from "lucide-react";

interface NetWorthCardProps {
  netWorth: number;
  cashBalance: number;
  realEstateValue: number;
  investmentValue: number;
  businessValue: number;
  otherAssetValue: number;
  accountBalances?: { name: string; balance: number }[];
}

export function NetWorthCard({
  netWorth,
  cashBalance,
  realEstateValue,
  investmentValue,
  businessValue,
  otherAssetValue,
  accountBalances,
}: NetWorthCardProps) {
  const assetBreakdown = [
    { label: "Real Estate", value: realEstateValue, icon: Home },
    { label: "Investments", value: investmentValue, icon: TrendingUp },
    { label: "Businesses", value: businessValue, icon: Briefcase },
    { label: "Other Assets", value: otherAssetValue, icon: Package },
  ].filter((item) => item.value > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Worth
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">
          {formatCurrency(netWorth)}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border">
          {accountBalances && accountBalances.length > 0 ? (
            accountBalances.map((acc) => (
              <div key={acc.name} className="flex items-center gap-2">
                <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{acc.name}</p>
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(acc.balance)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2">
              <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cash</p>
                <p className="text-sm font-medium tabular-nums">
                  {formatCurrency(cashBalance)}
                </p>
              </div>
            </div>
          )}
          {assetBreakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium tabular-nums">
                  {formatCurrency(item.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
