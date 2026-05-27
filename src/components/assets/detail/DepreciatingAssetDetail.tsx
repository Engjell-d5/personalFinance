import { TrendingDown, DollarSign, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Asset } from "@/lib/types";

interface DepreciatingAssetDetailProps {
  asset: Asset;
}

export function DepreciatingAssetDetail({
  asset,
}: DepreciatingAssetDetailProps) {
  const purchasePrice = asset.purchasePrice ?? 0;
  const currentValue = asset.currentValue ?? 0;
  const depreciationAmount = purchasePrice - currentValue;
  const depreciationPercent =
    purchasePrice > 0 ? (depreciationAmount / purchasePrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Current Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(currentValue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Purchase Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(purchasePrice)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Depreciation
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              -{formatCurrency(depreciationAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Depreciation %
            </CardTitle>
            <Percent className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              -{depreciationPercent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Asset Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {asset.depreciationRate != null && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Depreciation Rate
                </p>
                <p className="text-sm font-semibold">
                  {asset.depreciationRate}% / year
                </p>
              </div>
            )}
            {asset.purchaseDate && (
              <div>
                <p className="text-xs text-muted-foreground">Purchase Date</p>
                <p className="text-sm font-semibold">
                  {formatDate(asset.purchaseDate)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Scope</p>
              <Badge
                variant={
                  asset.scope === "business" ? "default" : "outline"
                }
                className="mt-0.5"
              >
                {asset.scope}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-semibold capitalize">
                {asset.category.replace("_", " ")}
              </p>
            </div>
          </div>

          {asset.description && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{asset.description}</p>
              </div>
            </>
          )}

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
