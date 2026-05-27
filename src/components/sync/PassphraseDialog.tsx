import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";

interface PassphraseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (passphrase: string) => void;
}

export function PassphraseDialog({
  open,
  onClose,
  onSubmit,
}: PassphraseDialogProps) {
  const [passphrase, setPassphrase] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters.");
      return;
    }

    if (passphrase !== confirm) {
      setError("Passphrases do not match.");
      return;
    }

    onSubmit(passphrase);
    setPassphrase("");
    setConfirm("");
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Set Encryption Passphrase
          </DialogTitle>
          <DialogDescription>
            Your data is encrypted before syncing to Google Drive. Use the same
            passphrase on all your devices.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Passphrase</Label>
            <Input
              type="password"
              placeholder="At least 8 characters"
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError("");
              }}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Confirm Passphrase</Label>
            <Input
              type="password"
              placeholder="Re-enter passphrase"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError("");
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Passphrase</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
