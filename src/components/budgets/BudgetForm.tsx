import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useCategories } from "@/hooks/useCategories";
import type { Budget, BudgetPeriod, Scope } from "@/lib/types";

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    categoryId: string;
    amount: number;
    period: BudgetPeriod;
    scope?: Scope;
  }) => void;
  initial?: Budget;
  existingCategoryIds: string[];
}

export function BudgetForm({
  open,
  onClose,
  onSubmit,
  initial,
  existingCategoryIds,
}: BudgetFormProps) {
  const categories = useCategories("expense");

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [period, setPeriod] = useState<BudgetPeriod>(
    initial?.period ?? "monthly"
  );
  const [scopeFilter, setScopeFilter] = useState<string>(
    initial?.scope ?? "all"
  );

  useEffect(() => {
    if (initial) {
      setCategoryId(initial.categoryId);
      setAmount(initial.amount.toString());
      setPeriod(initial.period);
      setScopeFilter(initial.scope ?? "all");
    } else {
      setCategoryId("");
      setAmount("");
      setPeriod("monthly");
      setScopeFilter("all");
    }
  }, [initial]);

  const availableCategories = categories.filter((c) => {
    if (initial && c.id === initial.categoryId) return true;
    return !existingCategoryIds.includes(c.id);
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!categoryId || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSubmit({
      categoryId,
      amount: parsedAmount,
      period,
      scope: scopeFilter === "all" ? undefined : (scopeFilter as Scope),
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Budget" : "Add Budget"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: c.color ?? "#737373" }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as BudgetPeriod)}
            >
              <SelectTrigger id="period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope</Label>
            <Select value={scopeFilter} onValueChange={setScopeFilter}>
              <SelectTrigger id="scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initial ? "Save Changes" : "Add Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
