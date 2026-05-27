import { Link } from "react-router";
import {
  Trash2,
  Pencil,
  Home,
  Briefcase,
  TrendingUp,
  Car,
  Wrench,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Asset, AssetCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<AssetCategory, React.ElementType> = {
  real_estate: Home,
  business: Briefcase,
  investment: TrendingUp,
  vehicle: Car,
  equipment: Wrench,
  other: Package,
};

const categoryLabels: Record<AssetCategory, string> = {
  real_estate: "Real Estate",
  business: "Business",
  investment: "Investment",
  vehicle: "Vehicle",
  equipment: "Equipment",
  other: "Other",
};

const categoryColors: Record<AssetCategory, string> = {
  real_estate:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  business:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  investment:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  vehicle:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  equipment:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  other:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

function getDisplayValue(asset: Asset) {
  if (
    asset.category === "investment" &&
    asset.units != null &&
    asset.currentPrice != null
  ) {
    const totalValue = asset.units * asset.currentPrice;
    const costBasis =
      asset.units * (asset.purchasePrice ?? asset.currentPrice);
    const gainLoss = totalValue - costBasis;
    const gainLossPercent =
      costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
    const isPositive = gainLoss >= 0;

    return {
      label: "Value",
      value: formatCurrency(totalValue),
      sub: `${isPositive ? "+" : ""}${gainLossPercent.toFixed(1)}%`,
      subColor: isPositive
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400",
    };
  }

  if (asset.category === "business" && asset.valuationMethod && asset.valuationMethod !== "manual") {
    const multiple = asset.valuationMultiple ?? 3;
    const base = asset.valuationMethod === "revenue_multiple"
      ? (asset.annualRevenue ?? 0)
      : (asset.annualProfit ?? 0);
    const computed = base * multiple;
    const label = asset.valuationMethod === "revenue_multiple" ? "Revenue" : "Profit";
    return {
      label: `Valuation (${label} ×${multiple})`,
      value: formatCurrency(computed),
      sub: asset.ownershipPercentage != null && asset.ownershipPercentage < 100
        ? `Your ${asset.ownershipPercentage}%: ${formatCurrency(computed * asset.ownershipPercentage / 100)}`
        : null,
      subColor: "text-muted-foreground",
    };
  }

  return {
    label: "Current Value",
    value: formatCurrency(asset.currentValue ?? 0),
    sub: null,
    subColor: "",
  };
}

export function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  const Icon = categoryIcons[asset.category];
  const display = getDisplayValue(asset);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{asset.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-1.5 py-0 border-0",
                    categoryColors[asset.category]
                  )}
                >
                  {categoryLabels[asset.category]}
                </Badge>
                <Badge
                  variant={asset.scope === "business" ? "default" : "outline"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {asset.scope}
                </Badge>
              </div>
              {asset.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {asset.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.preventDefault();
                onEdit(asset);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                onDelete(asset.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{display.label}</p>
              <p className="text-lg font-bold tabular-nums">{display.value}</p>
              {display.sub && (
                <p
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    display.subColor
                  )}
                >
                  {display.sub}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/assets/${asset.id}`}>
                Details
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
