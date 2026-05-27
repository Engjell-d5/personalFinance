import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAccounts } from "@/hooks/useAccounts";
import { useAssets } from "@/hooks/useAssets";
import { useCategories } from "@/hooks/useCategories";
import { db } from "@/db/index";
import type { RecurrenceFrequency } from "@/lib/types";

function computeNextDate(dateStr: string, freq: RecurrenceFrequency): string {
  const base = new Date(dateStr);
  let next: Date;
  switch (freq) {
    case "daily": next = addDays(base, 1); break;
    case "weekly": next = addWeeks(base, 1); break;
    case "monthly": next = addMonths(base, 1); break;
    case "quarterly": next = addMonths(base, 3); break;
    case "yearly": next = addYears(base, 1); break;
  }
  return next.toISOString().split("T")[0]!;
}

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const transferTypes = [
  { value: "owner_salary", label: "Owner's Salary", description: "Regular salary from business to personal" },
  { value: "owner_draw", label: "Owner's Draw", description: "Withdraw profits from business" },
  { value: "reimbursement", label: "Reimbursement", description: "Business reimburses personal expense" },
  { value: "investment", label: "Capital Investment", description: "Personal funds into business" },
  { value: "custom", label: "Custom Transfer", description: "Any other transfer between scopes" },
];

export function TransferForm({ open, onClose, onComplete }: TransferFormProps) {
  const [transferType, setTransferType] = useState("owner_salary");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]!);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [businessAssetId, setBusinessAssetId] = useState("");
  const [notes, setNotes] = useState("");
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [recurFrequency, setRecurFrequency] = useState<RecurrenceFrequency>("monthly");

  const { accounts } = useAccounts();
  const { assets } = useAssets("business");
  const bizExpenseCategories = useCategories("expense", "business");
  const personalIncomeCategories = useCategories("income", "personal");

  useEffect(() => {
    if (open) {
      setTransferType("owner_salary");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]!);
      setFromAccountId("");
      setToAccountId("");
      setBusinessAssetId(assets.length === 1 ? assets[0]!.id : "");
      setNotes("");
      setMakeRecurring(false);
      setRecurFrequency("monthly");
    }
  }, [open, assets]);

  useEffect(() => {
    if (businessAssetId) {
      const biz = assets.find((a) => a.id === businessAssetId);
      if (biz?.linkedAccountId) {
        const isReverse = transferType === "investment";
        if (isReverse) {
          setToAccountId(biz.linkedAccountId);
        } else {
          setFromAccountId(biz.linkedAccountId);
        }
      }
    }
  }, [businessAssetId, assets, transferType]);

  function getDefaultDescription(): string {
    const t = transferTypes.find((t) => t.value === transferType);
    return t?.label ?? "Transfer";
  }

  function getCategoryIds(): { expenseCategoryId: string; incomeCategoryId: string } {
    let expenseCategoryId = bizExpenseCategories.find((c) => c.id === "cat-biz-other")?.id ?? bizExpenseCategories[0]?.id ?? "";
    let incomeCategoryId = personalIncomeCategories.find((c) => c.id === "cat-salary")?.id ?? personalIncomeCategories[0]?.id ?? "";

    if (transferType === "owner_salary") {
      expenseCategoryId = bizExpenseCategories.find((c) => c.id === "cat-biz-salary")?.id ?? expenseCategoryId;
      incomeCategoryId = personalIncomeCategories.find((c) => c.id === "cat-salary")?.id ?? incomeCategoryId;
    } else if (transferType === "owner_draw") {
      expenseCategoryId = bizExpenseCategories.find((c) => c.id === "cat-biz-draw")?.id ?? expenseCategoryId;
      incomeCategoryId = personalIncomeCategories.find((c) => c.id === "cat-personal-income-other")?.id ?? incomeCategoryId;
    }

    return { expenseCategoryId, incomeCategoryId };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const now = new Date().toISOString();
    const transferId = uuid();
    const desc = description.trim() || getDefaultDescription();
    const { expenseCategoryId, incomeCategoryId } = getCategoryIds();

    const isReverse = transferType === "investment";

    await db.transaction("rw", db.transactions, async () => {
      await db.transactions.add({
        id: uuid(),
        date,
        amount: parsedAmount,
        type: "expense",
        scope: isReverse ? "personal" : "business",
        categoryId: isReverse ? (personalIncomeCategories[0]?.id ?? "") : expenseCategoryId,
        description: desc,
        accountId: fromAccountId || undefined,
        assetId: businessAssetId || undefined,
        transferId,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });

      await db.transactions.add({
        id: uuid(),
        date,
        amount: parsedAmount,
        type: "income",
        scope: isReverse ? "business" : "personal",
        categoryId: isReverse ? (bizExpenseCategories[0]?.id ?? "") : incomeCategoryId,
        description: desc,
        accountId: toAccountId || undefined,
        assetId: businessAssetId || undefined,
        transferId,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });
    });

    if (makeRecurring) {
      const nextDue = computeNextDate(date, recurFrequency);
      await db.recurringRules.bulkAdd([
        {
          id: uuid(),
          amount: parsedAmount,
          type: "expense" as const,
          scope: isReverse ? "personal" as const : "business" as const,
          categoryId: isReverse ? (personalIncomeCategories[0]?.id ?? "") : expenseCategoryId,
          description: desc,
          assetId: businessAssetId || undefined,
          frequency: recurFrequency,
          startDate: date,
          nextDueDate: nextDue,
          isActive: true,
          lastGeneratedDate: date,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uuid(),
          amount: parsedAmount,
          type: "income" as const,
          scope: isReverse ? "business" as const : "personal" as const,
          categoryId: isReverse ? (bizExpenseCategories[0]?.id ?? "") : incomeCategoryId,
          description: desc,
          assetId: businessAssetId || undefined,
          frequency: recurFrequency,
          startDate: date,
          nextDueDate: nextDue,
          isActive: true,
          lastGeneratedDate: date,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    onComplete();
    onClose();
  }

  const isReverse = transferType === "investment";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer</DialogTitle>
          <DialogDescription>
            Move money between business and personal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Transfer Type</Label>
            <Select value={transferType} onValueChange={setTransferType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transferTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {transferTypes.find((t) => t.value === transferType)?.description}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Amount (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input
              placeholder={getDefaultDescription()}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {assets.length > 0 && (
            <div className="space-y-1.5">
              <Label>Business</Label>
              <Select value={businessAssetId} onValueChange={setBusinessAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {accounts.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isReverse ? "From (Personal)" : "From (Business)"}</Label>
                <Select value={fromAccountId} onValueChange={setFromAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account" />
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
              <div className="space-y-1.5">
                <Label>{isReverse ? "To (Business)" : "To (Personal)"}</Label>
                <Select value={toAccountId} onValueChange={setToAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account" />
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
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Make recurring</p>
              <p className="text-xs text-muted-foreground">
                Auto-generate this transfer on a schedule
              </p>
            </div>
            <Switch
              checked={makeRecurring}
              onCheckedChange={setMakeRecurring}
            />
          </div>

          {makeRecurring && (
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={recurFrequency} onValueChange={(v) => setRecurFrequency(v as RecurrenceFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Transfer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
