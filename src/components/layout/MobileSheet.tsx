import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { X, Wallet, Repeat, Target, BarChart3, Settings } from "lucide-react";

const sheetNavItems = [
  { to: "/accounts", icon: Wallet, label: "Accounts" },
  { to: "/recurring", icon: Repeat, label: "Recurring" },
  { to: "/budgets", icon: Target, label: "Budgets" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSheet({ open, onClose }: MobileSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-xl p-4 animate-in slide-in-from-bottom">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-sm">More</span>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1">
          {sheetNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/70 hover:bg-accent/50 hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
