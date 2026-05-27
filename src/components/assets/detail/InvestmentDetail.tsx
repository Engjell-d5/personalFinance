import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Asset, InvestmentType } from "@/lib/types";

interface InvestmentDetailProps {
  asset: Asset;
}

const typeColors: Record<InvestmentType, string> = {
  stock: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  etf: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  crypto:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  bond: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const typeLabels: Record<InvestmentType, string> = {
  stock: "Stock",
  etf: "ETF",
  crypto: "Crypto",
  bond: "Bond",
  gold: "Gold",
  other: "Other",
};

export function InvestmentDetail({ asset }: InvestmentDetailProps) {
  const units = asset.units ?? 0;
  const currentPrice = asset.currentPrice ?? 0;
  const purchasePrice = asset.purchasePrice ?? 0;

  const totalValue = units * currentPrice;
  const costBasis = units * (purchasePrice > 0 ? purchasePrice / units || purchasePrice : currentPrice);
  // If purchasePrice is the total cost basis, use it directly
  const effectiveCostBasis = purchasePrice > 0 ? purchasePrice : costBasis;
  const gainLoss = totalValue - effectiveCostBasis;
  const gainLossPercent =
    effectiveCostBasis > 0 ? (gainLoss / effectiveCostBasis) * 100 : 0;
  const isPositive = gainLoss >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Cost Basis
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(effectiveCostBasis)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Gain / Loss
            </CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(gainLoss)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Return
            </CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? "+" : ""}
              {gainLossPercent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Investment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {asset.symbol && (
              <div>
                <p className="text-xs text-muted-foreground">Symbol</p>
                <p className="text-sm font-semibold font-mono">
                  {asset.symbol}
                </p>
              </div>
            )}
            {asset.investmentType && (
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "mt-0.5 border-0",
                    typeColors[asset.investmentType]
                  )}
                >
                  {typeLabels[asset.investmentType]}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Units / Shares</p>
              <p className="text-sm font-semibold tabular-nums">{units}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Current Price / Unit
              </p>
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(currentPrice)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Purchase Price</p>
              <p className="text-sm font-semibold tabular-nums">
                {formatCurrency(purchasePrice)}
              </p>
            </div>
            {asset.purchaseDate && (
              <div>
                <p className="text-xs text-muted-foreground">Purchase Date</p>
                <p className="text-sm font-semibold">
                  {formatDate(asset.purchaseDate)}
                </p>
              </div>
            )}
          </div>

          {asset.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm mt-1">{asset.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
