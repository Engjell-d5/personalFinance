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
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { useAssets } from "@/hooks/useAssets";
import { db } from "@/db/index";
import type {
  Transaction,
  TransactionType,
  Scope,
  RecurrenceFrequency,
} from "@/lib/types";

function computeNextDueDate(
  dateStr: string,
  frequency: RecurrenceFrequency
): string {
  const base = new Date(dateStr);
  let next: Date;
  switch (frequency) {
    case "daily":
      next = addDays(base, 1);
      break;
    case "weekly":
      next = addWeeks(base, 1);
      break;
    case "monthly":
      next = addMonths(base, 1);
      break;
    case "quarterly":
      next = addMonths(base, 3);
      break;
    case "yearly":
      next = addYears(base, 1);
      break;
    default:
      next = addMonths(base, 1);
  }
  return next.toISOString().split("T")[0]!;
}

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
  defaultType: TransactionType;
  initial?: Transaction;
}

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  defaultType,
  initial,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType);
  const [scope, setScope] = useState<Scope>(initial?.scope ?? "personal");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().split("T")[0]!
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [accountId, setAccountId] = useState(initial?.accountId ?? "");
  const [assetId, setAssetId] = useState(initial?.assetId ?? "");
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [recurFrequency, setRecurFrequency] =
    useState<RecurrenceFrequency>("monthly");
  const [recurEndDate, setRecurEndDate] = useState("");

  const categories = useCategories(type, scope);
  const { accounts } = useAccounts();
  const { assets } = useAssets();

  useEffect(() => {
    setType(initial?.type ?? defaultType);
    setScope(initial?.scope ?? "personal");
    setAmount(initial?.amount?.toString() ?? "");
    setDescription(initial?.description ?? "");
    setCategoryId(initial?.categoryId ?? "");
    setDate(initial?.date ?? new Date().toISOString().split("T")[0]!);
    setNotes(initial?.notes ?? "");
    setAccountId(initial?.accountId ?? "");
    setAssetId(initial?.assetId ?? "");
    setMakeRecurring(false);
    setRecurFrequency("monthly");
    setRecurEndDate("");
  }, [initial, defaultType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (!categoryId || !description.trim()) return;

    onSubmit({
      type,
      scope,
      amount: parsedAmount,
      description: description.trim(),
      categoryId,
      accountId: accountId || undefined,
      assetId: assetId || undefined,
      date,
      notes: notes.trim() || undefined,
    });

    if (makeRecurring && !initial) {
      const now = new Date().toISOString();
      const nextDueDate = computeNextDueDate(date, recurFrequency);
      await db.recurringRules.add({
        id: uuid(),
        amount: parsedAmount,
        type,
        scope,
        categoryId,
        description: description.trim(),
        assetId: assetId || undefined,
        frequency: recurFrequency,
        startDate: date,
        endDate: recurEndDate || undefined,
        nextDueDate,
        isActive: true,
        lastGeneratedDate: date,
        createdAt: now,
        updatedAt: now,
      });
    }

    setAmount("");
    setDescription("");
    setCategoryId("");
    setAccountId("");
    setAssetId("");
    setNotes("");
    setMakeRecurring(false);
    setRecurFrequency("monthly");
    setRecurEndDate("");
    setDate(new Date().toISOString().split("T")[0]!);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit" : "Add"} {type === "expense" ? "Expense" : "Income"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v as TransactionType);
                  setCategoryId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Select
                value={scope}
                onValueChange={(v) => {
                  setScope(v as Scope);
                  setCategoryId("");
                }}
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            {accounts.length > 0 && (
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select
                  value={accountId || (accounts.length === 1 ? accounts[0]!.id : "")}
                  onValueChange={setAccountId}
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
            {assets.length > 0 && (
              <div className="space-y-1.5">
                <Label>Linked Asset</Label>
                <Select value={assetId} onValueChange={setAssetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {assets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="make-recurring">Make recurring</Label>
                  <Switch
                    id="make-recurring"
                    checked={makeRecurring}
                    onCheckedChange={setMakeRecurring}
                  />
                </div>

                {makeRecurring && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Frequency</Label>
                      <Select
                        value={recurFrequency}
                        onValueChange={(v) =>
                          setRecurFrequency(v as RecurrenceFrequency)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>End Date (optional)</Label>
                      <Input
                        type="date"
                        value={recurEndDate}
                        onChange={(e) => setRecurEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initial ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
