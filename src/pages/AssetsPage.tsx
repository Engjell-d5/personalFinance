import { useState, useMemo } from "react";
import {
  Plus,
  DollarSign,
  Home,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetCard } from "@/components/assets/AssetCard";
import { AssetForm } from "@/components/assets/AssetForm";
import { useAssets } from "@/hooks/useAssets";
import { formatCurrency } from "@/lib/format";
import type { Asset, AssetCategory } from "@/lib/types";

type FilterTab = "all" | AssetCategory;

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "real_estate", label: "Real Estate" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investments" },
  { value: "vehicle", label: "Vehicles" },
  { value: "equipment", label: "Equipment" },
  { value: "other", label: "Other" },
];

const emptyMessages: Record<FilterTab, { title: string; subtitle: string }> = {
  all: {
    title: "No assets yet.",
    subtitle:
      "Add properties, businesses, investments, vehicles, and more.",
  },
  real_estate: {
    title: "No real estate assets.",
    subtitle: "Add your properties to track values, tenants, and finances.",
  },
  business: {
    title: "No business assets.",
    subtitle: "Add your businesses to track P&L and valuation.",
  },
  investment: {
    title: "No investment assets.",
    subtitle:
      "Add stocks, ETFs, crypto, bonds, and other investments.",
  },
  vehicle: {
    title: "No vehicles.",
    subtitle: "Add your vehicles to track value and depreciation.",
  },
  equipment: {
    title: "No equipment.",
    subtitle: "Add equipment to track value and depreciation.",
  },
  other: {
    title: "No other assets.",
    subtitle: "Add any other valuable assets you want to track.",
  },
};

export function AssetsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | undefined>();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const { assets, addAsset, updateAsset, deleteAsset } = useAssets();

  const filtered = useMemo(() => {
    if (activeTab === "all") return assets;
    return assets.filter((a) => a.category === activeTab);
  }, [assets, activeTab]);

  const stats = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => {
      if (
        a.category === "investment" &&
        a.units != null &&
        a.currentPrice != null
      ) {
        return sum + a.units * a.currentPrice;
      }
      if (a.category === "business" && a.valuationMethod && a.valuationMethod !== "manual") {
        const multiple = a.valuationMultiple ?? 3;
        const base = a.valuationMethod === "revenue_multiple"
          ? (a.annualRevenue ?? 0)
          : (a.annualProfit ?? 0);
        return sum + base * multiple;
      }
      return sum + (a.currentValue ?? 0);
    }, 0);

    const countByCategory = assets.reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { totalValue, count: assets.length, countByCategory };
  }, [assets]);

  function handleEdit(asset: Asset) {
    setEditing(asset);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditing(undefined);
  }

  const empty = emptyMessages[activeTab];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
          <p className="text-sm text-muted-foreground">
            {stats.count} asset{stats.count !== 1 ? "s" : ""} &middot;{" "}
            {formatCurrency(stats.totalValue)} total value
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Asset
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatCurrency(stats.totalValue)}
            </div>
          </CardContent>
        </Card>
        {(
          [
            ["real_estate", "Real Estate", Home],
            ["business", "Business", Briefcase],
            ["investment", "Investments", TrendingUp],
          ] as const
        ).map(([key, label, Icon]) =>
          (stats.countByCategory[key] ?? 0) > 0 ? (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {stats.countByCategory[key]}
                </div>
              </CardContent>
            </Card>
          ) : null
        )}
      </div>

      {/* Category Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as FilterTab)}
      >
        <TabsList className="flex flex-wrap h-auto gap-1">
          {filterTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
              {tab.value !== "all" &&
                (stats.countByCategory[tab.value] ?? 0) > 0 && (
                  <span className="ml-1 text-[10px] text-muted-foreground">
                    ({stats.countByCategory[tab.value]})
                  </span>
                )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Asset Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground text-sm">{empty.title}</p>
            <p className="text-muted-foreground text-xs mt-1">
              {empty.subtitle}
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEdit={handleEdit}
              onDelete={deleteAsset}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <AssetForm
        open={formOpen}
        onClose={handleClose}
        initial={editing}
        onSubmit={async (data) => {
          if (editing) {
            await updateAsset(editing.id, data);
          } else {
            await addAsset(data);
          }
        }}
      />
    </div>
  );
}
