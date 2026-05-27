import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

interface LockScreenProps {
  onUnlock: () => void;
  isFirstTime: boolean;
}

export function LockScreen({ onUnlock, isFirstTime }: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isFirstTime) {
      if (pin.length < 4) {
        setError("PIN must be at least 4 characters.");
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs do not match.");
        return;
      }
      localStorage.setItem("pf-app-pin", pin);
      onUnlock();
    } else {
      const stored = localStorage.getItem("pf-app-pin");
      if (pin === stored) {
        onUnlock();
      } else {
        setError("Incorrect PIN.");
        setPin("");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Personal Finance</h1>
          <p className="text-sm text-muted-foreground text-center">
            {isFirstTime
              ? "Set a PIN to protect your data."
              : "Enter your PIN to continue."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder={isFirstTime ? "Choose a PIN" : "Enter PIN"}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError("");
            }}
            autoFocus
            className="text-center text-lg tracking-widest"
          />

          {isFirstTime && (
            <Input
              type="password"
              placeholder="Confirm PIN"
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value);
                setError("");
              }}
              className="text-center text-lg tracking-widest"
            />
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button type="submit" className="w-full">
            {isFirstTime ? "Set PIN & Enter" : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}
