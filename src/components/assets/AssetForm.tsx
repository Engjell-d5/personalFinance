import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import {
  Home,
  Briefcase,
  TrendingUp,
  Car,
  Wrench,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAccounts } from "@/hooks/useAccounts";
import { db } from "@/db/index";
import type {
  Asset,
  AssetCategory,
  Scope,
  PropertyStatus,
  InvestmentType,
} from "@/lib/types";

interface AssetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<Asset, "id" | "createdAt" | "updatedAt">
  ) => void;
  initial?: Asset;
}

const categoryOptions: {
  value: AssetCategory;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "real_estate", label: "Real Estate", icon: Home },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "investment", label: "Investment", icon: TrendingUp },
  { value: "vehicle", label: "Vehicle", icon: Car },
  { value: "equipment", label: "Equipment", icon: Wrench },
  { value: "other", label: "Other", icon: Package },
];

const investmentTypes: { value: InvestmentType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "bond", label: "Bond" },
  { value: "gold", label: "Gold" },
  { value: "other", label: "Other" },
];

const propertyStatuses: { value: PropertyStatus; label: string }[] = [
  { value: "occupied", label: "Occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "maintenance", label: "Maintenance" },
];

export function AssetForm({
  open,
  onClose,
  onSubmit,
  initial,
}: AssetFormProps) {
  const [category, setCategory] = useState<AssetCategory>(
    initial?.category ?? "other"
  );
  const [name, setName] = useState(initial?.name ?? "");
  const [scope, setScope] = useState<Scope>(initial?.scope ?? "personal");
  const [purchasePrice, setPurchasePrice] = useState(
    initial?.purchasePrice?.toString() ?? ""
  );
  const [currentValue, setCurrentValue] = useState(
    initial?.currentValue?.toString() ?? ""
  );
  const [purchaseDate, setPurchaseDate] = useState(
    initial?.purchaseDate ?? new Date().toISOString().split("T")[0]!
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  // Real estate fields
  const [address, setAddress] = useState(initial?.address ?? "");
  const [monthlyMortgage, setMonthlyMortgage] = useState(
    initial?.monthlyMortgage?.toString() ?? ""
  );
  const [propertyStatus, setPropertyStatus] = useState<PropertyStatus>(
    initial?.propertyStatus ?? "vacant"
  );

  // Investment fields
  const [symbol, setSymbol] = useState(initial?.symbol ?? "");
  const [investmentType, setInvestmentType] = useState<InvestmentType>(
    initial?.investmentType ?? "stock"
  );
  const [units, setUnits] = useState(initial?.units?.toString() ?? "");
  const [currentPrice, setCurrentPrice] = useState(
    initial?.currentPrice?.toString() ?? ""
  );

  // Depreciation fields
  const [depreciationRate, setDepreciationRate] = useState(
    initial?.depreciationRate?.toString() ?? ""
  );

  // Business fields
  const [businessType, setBusinessType] = useState(
    initial?.businessType ?? ""
  );
  const [ownershipPercentage, setOwnershipPercentage] = useState(
    initial?.ownershipPercentage?.toString() ?? "100"
  );
  const [linkedAccountId, setLinkedAccountId] = useState(
    initial?.linkedAccountId ?? ""
  );
  const [valuationMethod, setValuationMethod] = useState<string>(
    initial?.valuationMethod ?? "manual"
  );
  const [valuationMultiple, setValuationMultiple] = useState(
    initial?.valuationMultiple?.toString() ?? "3"
  );
  const [annualRevenue, setAnnualRevenue] = useState(
    initial?.annualRevenue?.toString() ?? ""
  );
  const [annualProfit, setAnnualProfit] = useState(
    initial?.annualProfit?.toString() ?? ""
  );

  const [recordPurchase, setRecordPurchase] = useState(false);
  const [purchaseAccountId, setPurchaseAccountId] = useState("");
  const { accounts } = useAccounts();

  useEffect(() => {
    setCategory(initial?.category ?? "other");
    setName(initial?.name ?? "");
    setScope(initial?.scope ?? "personal");
    setPurchasePrice(initial?.purchasePrice?.toString() ?? "");
    setCurrentValue(initial?.currentValue?.toString() ?? "");
    setPurchaseDate(
      initial?.purchaseDate ?? new Date().toISOString().split("T")[0]!
    );
    setNotes(initial?.notes ?? "");
    setDescription(initial?.description ?? "");
    setAddress(initial?.address ?? "");
    setMonthlyMortgage(initial?.monthlyMortgage?.toString() ?? "");
    setPropertyStatus(initial?.propertyStatus ?? "vacant");
    setSymbol(initial?.symbol ?? "");
    setInvestmentType(initial?.investmentType ?? "stock");
    setUnits(initial?.units?.toString() ?? "");
    setCurrentPrice(initial?.currentPrice?.toString() ?? "");
    setDepreciationRate(initial?.depreciationRate?.toString() ?? "");
    setBusinessType(initial?.businessType ?? "");
    setOwnershipPercentage(initial?.ownershipPercentage?.toString() ?? "100");
    setLinkedAccountId(initial?.linkedAccountId ?? "");
    setValuationMethod(initial?.valuationMethod ?? "manual");
    setValuationMultiple(initial?.valuationMultiple?.toString() ?? "3");
    setAnnualRevenue(initial?.annualRevenue?.toString() ?? "");
    setAnnualProfit(initial?.annualProfit?.toString() ?? "");
    setRecordPurchase(false);
    setPurchaseAccountId("");
  }, [initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedPurchasePrice = parseFloat(purchasePrice);
    const parsedCurrentValue = parseFloat(currentValue);

    const base: Omit<Asset, "id" | "createdAt" | "updatedAt"> = {
      name: name.trim(),
      category,
      scope,
      purchasePrice: isNaN(parsedPurchasePrice)
        ? undefined
        : parsedPurchasePrice,
      currentValue: isNaN(parsedCurrentValue)
        ? undefined
        : parsedCurrentValue,
      purchaseDate: purchaseDate || undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive: initial?.isActive ?? true,
    };

    // Category-specific fields
    if (category === "real_estate") {
      base.address = address.trim() || undefined;
      const parsedMortgage = parseFloat(monthlyMortgage);
      base.monthlyMortgage = isNaN(parsedMortgage)
        ? undefined
        : parsedMortgage;
      base.propertyStatus = propertyStatus;
    }

    if (category === "investment") {
      base.symbol = symbol.trim().toUpperCase() || undefined;
      base.investmentType = investmentType;
      const parsedUnits = parseFloat(units);
      base.units = isNaN(parsedUnits) ? undefined : parsedUnits;
      const parsedPrice = parseFloat(currentPrice);
      base.currentPrice = isNaN(parsedPrice) ? undefined : parsedPrice;
    }

    if (category === "vehicle" || category === "equipment") {
      const parsedRate = parseFloat(depreciationRate);
      base.depreciationRate = isNaN(parsedRate) ? undefined : parsedRate;
    }

    if (category === "business") {
      base.businessType = businessType.trim() || undefined;
      const parsedOwnership = parseFloat(ownershipPercentage);
      base.ownershipPercentage = isNaN(parsedOwnership) ? 100 : parsedOwnership;
      base.linkedAccountId = linkedAccountId || undefined;
      base.valuationMethod = valuationMethod as "manual" | "profit_multiple" | "revenue_multiple";
      const parsedMultiple = parseFloat(valuationMultiple);
      base.valuationMultiple = isNaN(parsedMultiple) ? 3 : parsedMultiple;
      const parsedRevenue = parseFloat(annualRevenue);
      base.annualRevenue = isNaN(parsedRevenue) ? undefined : parsedRevenue;
      const parsedProfit = parseFloat(annualProfit);
      base.annualProfit = isNaN(parsedProfit) ? undefined : parsedProfit;
    }

    if (category === "real_estate") {
      base.linkedAccountId = linkedAccountId || undefined;
    }

    if (recordPurchase && !initial && !isNaN(parsedPurchasePrice) && parsedPurchasePrice > 0) {
      const now = new Date().toISOString();
      const assetId = uuid();
      await db.transaction("rw", db.assets, db.transactions, async () => {
        await db.assets.add({
          ...base,
          id: assetId,
          createdAt: now,
          updatedAt: now,
        } as never);
        await db.transactions.add({
          id: uuid(),
          date: purchaseDate || now.split("T")[0]!,
          amount: parsedPurchasePrice,
          type: "expense",
          scope,
          categoryId: category === "real_estate" ? "cat-prop-purchase" : "cat-personal-other",
          description: `Purchase: ${name.trim()}`,
          accountId: purchaseAccountId || undefined,
          assetId,
          createdAt: now,
          updatedAt: now,
        });
      });
    } else {
      await onSubmit(base);
    }

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit" : "Add"} Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((opt) => {
                const Icon = opt.icon;
                const selected = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Downtown Apartment"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select
                value={scope}
                onValueChange={(v) => setScope(v as Scope)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Purchase Date</Label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Purchase Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>
            {!(category === "business" && valuationMethod !== "manual") && (
              <div className="space-y-1.5">
                <Label>Current Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Real Estate Fields */}
          {category === "real_estate" && (
            <>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input
                  placeholder="123 Main St, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Monthly Mortgage</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={monthlyMortgage}
                    onChange={(e) => setMonthlyMortgage(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={propertyStatus}
                    onValueChange={(v) =>
                      setPropertyStatus(v as PropertyStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Investment Fields */}
          {category === "investment" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Symbol / Ticker</Label>
                  <Input
                    placeholder="AAPL"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Investment Type</Label>
                  <Select
                    value={investmentType}
                    onValueChange={(v) =>
                      setInvestmentType(v as InvestmentType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Units / Shares</Label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="10"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Current Price / Unit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Vehicle / Equipment Fields */}
          {(category === "vehicle" || category === "equipment") && (
            <div className="space-y-1.5">
              <Label>Depreciation Rate (%/yr)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="10"
                value={depreciationRate}
                onChange={(e) => setDepreciationRate(e.target.value)}
              />
            </div>
          )}

          {/* Business Fields */}
          {category === "business" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Business Type</Label>
                  <Input
                    placeholder="e.g. SaaS, Consulting, Retail"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Ownership %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={ownershipPercentage}
                    onChange={(e) => setOwnershipPercentage(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Valuation Method</Label>
                  <Select value={valuationMethod} onValueChange={setValuationMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="profit_multiple">Profit Multiple</SelectItem>
                      <SelectItem value="revenue_multiple">Revenue Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {valuationMethod !== "manual" && (
                  <div className="space-y-1.5">
                    <Label>Multiplier (×)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="3"
                      value={valuationMultiple}
                      onChange={(e) => setValuationMultiple(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {valuationMethod !== "manual" && (
                <div className="grid grid-cols-2 gap-3">
                  {(valuationMethod === "revenue_multiple" || valuationMethod === "profit_multiple") && (
                    <div className="space-y-1.5">
                      <Label>Annual Revenue (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="200000"
                        value={annualRevenue}
                        onChange={(e) => setAnnualRevenue(e.target.value)}
                      />
                    </div>
                  )}
                  {valuationMethod === "profit_multiple" && (
                    <div className="space-y-1.5">
                      <Label>Annual Profit (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="50000"
                        value={annualProfit}
                        onChange={(e) => setAnnualProfit(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
              {valuationMethod !== "manual" && (
                <p className="text-xs text-muted-foreground">
                  {valuationMethod === "profit_multiple"
                    ? `Estimated value: ${annualProfit && valuationMultiple ? "€" + (parseFloat(annualProfit) * parseFloat(valuationMultiple)).toLocaleString() : "—"}`
                    : `Estimated value: ${annualRevenue && valuationMultiple ? "€" + (parseFloat(annualRevenue) * parseFloat(valuationMultiple)).toLocaleString() : "—"}`}
                </p>
              )}
              {accounts.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Business Account</Label>
                  <Select value={linkedAccountId} onValueChange={setLinkedAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link a bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}{acc.institution ? ` (${acc.institution})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Input
              placeholder="Brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {!initial && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Record purchase transaction</p>
                  <p className="text-xs text-muted-foreground">
                    Deduct the purchase price from an account
                  </p>
                </div>
                <Switch
                  checked={recordPurchase}
                  onCheckedChange={setRecordPurchase}
                />
              </div>

              {recordPurchase && accounts.length > 0 && (
                <div className="space-y-1.5">
                  <Label>From Account</Label>
                  <Select
                    value={purchaseAccountId || (accounts.length === 1 ? accounts[0]!.id : "")}
                    onValueChange={setPurchaseAccountId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
