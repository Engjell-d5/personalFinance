import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCategories } from "@/hooks/useCategories";
import { useAssets } from "@/hooks/useAssets";
import type {
  RecurringRule,
  TransactionType,
  Scope,
  RecurrenceFrequency,
} from "@/lib/types";

type RuleFormData = Omit<RecurringRule, "id" | "createdAt" | "updatedAt">;

interface RecurringRuleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RuleFormData) => void;
  initial?: RecurringRule;
}

export function RecurringRuleForm({
  open,
  onClose,
  onSubmit,
  initial,
}: RecurringRuleFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [scope, setScope] = useState<Scope>(initial?.scope ?? "personal");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    initial?.frequency ?? "monthly"
  );
  const [startDate, setStartDate] = useState(
    initial?.startDate ?? new Date().toISOString().split("T")[0]!
  );
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [assetId, setAssetId] = useState(initial?.assetId ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const categories = useCategories(type, scope);
  const { assets } = useAssets();

  useEffect(() => {
    setType(initial?.type ?? "expense");
    setScope(initial?.scope ?? "personal");
    setAmount(initial?.amount?.toString() ?? "");
    setDescription(initial?.description ?? "");
    setCategoryId(initial?.categoryId ?? "");
    setFrequency(initial?.frequency ?? "monthly");
    setStartDate(
      initial?.startDate ?? new Date().toISOString().split("T")[0]!
    );
    setEndDate(initial?.endDate ?? "");
    setAssetId(initial?.assetId ?? "");
    setIsActive(initial?.isActive ?? true);
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
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
      frequency,
      startDate,
      endDate: endDate || undefined,
      assetId: assetId || undefined,
      nextDueDate: initial?.nextDueDate ?? startDate,
      isActive,
      lastGeneratedDate: initial?.lastGeneratedDate,
    });

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit" : "Add"} Recurring Rule
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
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
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

          <div className="space-y-1.5">
            <Label>Amount ({"€"})</Label>
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
              placeholder="e.g. Netflix subscription"
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
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>End Date (optional)</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {assets.length > 0 && (
            <div className="space-y-1.5">
              <Label>Linked Asset (optional)</Label>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="rule-active">Active</Label>
            <Switch
              id="rule-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Update" : "Add"} Rule</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
