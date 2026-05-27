import { useState, useEffect } from "react";
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
import type { Account, AccountType } from "@/lib/types";

interface AccountFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Account, "id" | "createdAt" | "updatedAt">) => void;
  initial?: Account;
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit_card", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export function AccountForm({ open, onClose, onSubmit, initial }: AccountFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "checking");
  const [institution, setInstitution] = useState(initial?.institution ?? "");
  const [startingBalance, setStartingBalance] = useState(
    initial?.startingBalance?.toString() ?? ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");

  useEffect(() => {
    setName(initial?.name ?? "");
    setType(initial?.type ?? "checking");
    setInstitution(initial?.institution ?? "");
    setStartingBalance(initial?.startingBalance?.toString() ?? "");
    setNotes(initial?.notes ?? "");
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedBalance = parseFloat(startingBalance);
    if (isNaN(parsedBalance)) return;
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      type,
      institution: institution.trim() || undefined,
      startingBalance: parsedBalance,
      currency: "EUR",
      isActive: initial?.isActive ?? true,
      notes: notes.trim() || undefined,
    });

    setName("");
    setType("checking");
    setInstitution("");
    setStartingBalance("");
    setNotes("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit" : "Add"} Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Main Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as AccountType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Starting Balance</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Institution (optional)</Label>
            <Input
              placeholder="e.g. Chase Bank"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
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
