import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Pencil,
  Home,
  Briefcase,
  TrendingUp,
  Car,
  Wrench,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AssetForm } from "@/components/assets/AssetForm";
import { RealEstateDetail } from "@/components/assets/detail/RealEstateDetail";
import { BusinessDetail } from "@/components/assets/detail/BusinessDetail";
import { InvestmentDetail } from "@/components/assets/detail/InvestmentDetail";
import { DepreciatingAssetDetail } from "@/components/assets/detail/DepreciatingAssetDetail";
import { useAsset, useAssets } from "@/hooks/useAssets";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AssetCategory } from "@/lib/types";

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

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const asset = useAsset(id);
  const { updateAsset } = useAssets();
  const [editOpen, setEditOpen] = useState(false);

  if (asset === undefined) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          {id ? "Loading..." : "Asset not found."}
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link to="/assets">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Assets
          </Link>
        </Button>
      </div>
    );
  }

  const Icon = categoryIcons[asset.category];

  function renderDetail() {
    if (!asset) return null;

    switch (asset.category) {
      case "real_estate":
        return <RealEstateDetail asset={asset} />;
      case "business":
        return <BusinessDetail asset={asset} />;
      case "investment":
        return <InvestmentDetail asset={asset} />;
      case "vehicle":
      case "equipment":
        return <DepreciatingAssetDetail asset={asset} />;
      case "other":
      default:
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Current Value
                  </p>
                  <p className="text-lg font-bold tabular-nums">
                    {formatCurrency(asset.currentValue ?? 0)}
                  </p>
                </div>
                {asset.purchasePrice != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Purchase Price
                    </p>
                    <p className="text-lg font-bold tabular-nums">
                      {formatCurrency(asset.purchasePrice)}
                    </p>
                  </div>
                )}
              </div>
              {asset.purchaseDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Purchase Date
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDate(asset.purchaseDate)}
                    </p>
                  </div>
                </>
              )}
              {asset.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Description
                    </p>
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
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to="/assets">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight">
              {asset.name}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "border-0",
                categoryColors[asset.category]
              )}
            >
              {categoryLabels[asset.category]}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
      </div>

      {/* Category-specific detail view */}
      {renderDetail()}

      {/* Edit Asset Dialog */}
      <AssetForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={asset}
        onSubmit={async (data) => {
          await updateAsset(asset.id, data);
        }}
      />
    </div>
  );
}
