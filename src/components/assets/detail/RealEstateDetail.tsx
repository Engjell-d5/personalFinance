import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useTransactions } from "@/hooks/useTransactions";
import { useTenants } from "@/hooks/useTenants";
import { useMaintenance } from "@/hooks/useMaintenance";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Asset,
  PropertyStatus,
  Tenant,
  MaintenanceRecord,
  MaintenanceStatus,
} from "@/lib/types";

interface RealEstateDetailProps {
  asset: Asset;
}

const statusConfig: Record<
  PropertyStatus,
  { label: string; className: string }
> = {
  occupied: {
    label: "Occupied",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  vacant: {
    label: "Vacant",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  maintenance: {
    label: "Maintenance",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const maintenanceStatusConfig: Record<
  MaintenanceStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

export function RealEstateDetail({ asset }: RealEstateDetailProps) {
  const { transactions } = useTransactions({ assetId: asset.id });
  const propStatus = asset.propertyStatus
    ? statusConfig[asset.propertyStatus]
    : null;

  const { totalIncome, totalExpenses, netProfit } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expenses += t.amount;
    }
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(asset.currentValue ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Purchase Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(asset.purchasePrice ?? 0)}
            </p>
          </CardContent>
        </Card>
        {asset.monthlyMortgage != null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Mortgage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(asset.monthlyMortgage)}
              </p>
            </CardContent>
          </Card>
        )}
        {propStatus && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant="outline"
                className={cn("border-0 text-sm", propStatus.className)}
              >
                {propStatus.label}
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Address */}
      {asset.address && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{asset.address}</span>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="financials">
        <TabsList>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="financials">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Income
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Net Profit
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-2xl font-bold tabular-nums",
                    netProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatCurrency(netProfit)}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tenants</CardTitle>
            </CardHeader>
            <CardContent>
              <TenantSection assetId={asset.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Maintenance Log</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceSection assetId={asset.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tenant Section                                                     */
/* ------------------------------------------------------------------ */

function TenantSection({ assetId }: { assetId: string }) {
  const { tenants, addTenant, updateTenant, deleteTenant } =
    useTenants(assetId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | undefined>();

  function handleEdit(tenant: Tenant) {
    setEditing(tenant);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditing(undefined);
  }

  async function handleSubmit(
    data: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ) {
    if (editing) {
      await updateTenant(editing.id, data);
    } else {
      await addTenant(data);
    }
    handleClose();
  }

  return (
    <div className="space-y-4">
      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">No tenants yet.</p>
          <p className="text-muted-foreground text-xs mt-1">
            Add a tenant to start tracking rental income.
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tenant
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tenants.length} tenant{tenants.length !== 1 ? "s" : ""}
            </p>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Tenant
            </Button>
          </div>

          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {tenant.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-0 text-[10px] px-1.5 py-0",
                          tenant.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400"
                        )}
                      >
                        {tenant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold tabular-nums mt-1">
                      {formatCurrency(tenant.monthlyRent)}/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(tenant)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteTenant(tenant.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Lease: {formatDate(tenant.leaseStart)}
                    {tenant.leaseEnd
                      ? ` - ${formatDate(tenant.leaseEnd)}`
                      : " - ongoing"}
                  </span>
                  {tenant.depositAmount != null && (
                    <span>
                      Deposit: {formatCurrency(tenant.depositAmount)}
                    </span>
                  )}
                </div>

                {(tenant.email || tenant.phone) && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {tenant.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {tenant.email}
                      </span>
                    )}
                    {tenant.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {tenant.phone}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <TenantFormDialog
        open={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        assetId={assetId}
        initial={editing}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tenant Form Dialog                                                 */
/* ------------------------------------------------------------------ */

interface TenantFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Tenant, "id" | "createdAt" | "updatedAt">) => void;
  assetId: string;
  initial?: Tenant;
}

function TenantFormDialog({
  open,
  onClose,
  onSubmit,
  assetId,
  initial,
}: TenantFormDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [leaseStart, setLeaseStart] = useState(
    new Date().toISOString().split("T")[0]!
  );
  const [leaseEnd, setLeaseEnd] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setEmail(initial.email ?? "");
      setPhone(initial.phone ?? "");
      setLeaseStart(initial.leaseStart);
      setLeaseEnd(initial.leaseEnd ?? "");
      setMonthlyRent(initial.monthlyRent.toString());
      setDepositAmount(initial.depositAmount?.toString() ?? "");
      setNotes(initial.notes ?? "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setLeaseStart(new Date().toISOString().split("T")[0]!);
      setLeaseEnd("");
      setMonthlyRent("");
      setDepositAmount("");
      setNotes("");
    }
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedRent = parseFloat(monthlyRent);
    if (!name.trim() || isNaN(parsedRent) || parsedRent <= 0) return;

    const parsedDeposit = parseFloat(depositAmount);

    onSubmit({
      assetId,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      leaseStart,
      leaseEnd: leaseEnd || undefined,
      monthlyRent: parsedRent,
      depositAmount: isNaN(parsedDeposit) ? undefined : parsedDeposit,
      isActive: initial?.isActive ?? true,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit" : "Add"} Tenant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="Tenant name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                placeholder="+49 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Monthly Rent</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lease Start</Label>
              <Input
                type="date"
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Lease End</Label>
              <Input
                type="date"
                value={leaseEnd}
                onChange={(e) => setLeaseEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Deposit Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
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

/* ------------------------------------------------------------------ */
/*  Maintenance Section                                                */
/* ------------------------------------------------------------------ */

function MaintenanceSection({ assetId }: { assetId: string }) {
  const { records, addRecord, updateRecord, deleteRecord } =
    useMaintenance(assetId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | undefined>();

  function handleEdit(record: MaintenanceRecord) {
    setEditing(record);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditing(undefined);
  }

  async function handleSubmit(
    data: Omit<MaintenanceRecord, "id" | "createdAt" | "updatedAt">
  ) {
    if (editing) {
      await updateRecord(editing.id, data);
    } else {
      await addRecord(data);
    }
    handleClose();
  }

  return (
    <div className="space-y-4">
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No maintenance records yet.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Track repairs, improvements, and maintenance costs.
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Record
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {records.length} record{records.length !== 1 ? "s" : ""}
            </p>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Record
            </Button>
          </div>

          <div className="space-y-2">
            {records.map((record) => {
              const status = maintenanceStatusConfig[record.status];
              return (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {record.description}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 border-0 text-[10px] px-1.5 py-0",
                          status.className
                        )}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(record.date)}
                      </span>
                      {record.vendor && (
                        <span className="text-xs text-muted-foreground">
                          &middot; {record.vendor}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                    {formatCurrency(record.cost)}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(record)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteRecord(record.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <MaintenanceFormDialog
        open={formOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        assetId={assetId}
        initial={editing}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Maintenance Form Dialog                                            */
/* ------------------------------------------------------------------ */

interface MaintenanceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<MaintenanceRecord, "id" | "createdAt" | "updatedAt">
  ) => void;
  assetId: string;
  initial?: MaintenanceRecord;
}

function MaintenanceFormDialog({
  open,
  onClose,
  onSubmit,
  assetId,
  initial,
}: MaintenanceFormDialogProps) {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]!
  );
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [vendor, setVendor] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus>("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initial) {
      setDate(initial.date);
      setDescription(initial.description);
      setCost(initial.cost.toString());
      setVendor(initial.vendor ?? "");
      setStatus(initial.status);
      setNotes(initial.notes ?? "");
    } else {
      setDate(new Date().toISOString().split("T")[0]!);
      setDescription("");
      setCost("");
      setVendor("");
      setStatus("pending");
      setNotes("");
    }
  }, [initial, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedCost = parseFloat(cost);
    if (!description.trim() || isNaN(parsedCost) || parsedCost < 0) return;

    onSubmit({
      assetId,
      date,
      description: description.trim(),
      cost: parsedCost,
      vendor: vendor.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit" : "Add"} Maintenance Record
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              placeholder="e.g. Plumbing repair"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cost</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Input
                placeholder="Company or person"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as MaintenanceStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
