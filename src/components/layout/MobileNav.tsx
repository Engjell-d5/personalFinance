import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  MoreHorizontal,
} from "lucide-react";

const mobileNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/expenses", icon: ArrowDownCircle, label: "Expenses" },
  { to: "/income", icon: ArrowUpCircle, label: "Income" },
  { to: "/assets", icon: Package, label: "Assets" },
];

interface MobileNavProps {
  onMoreClick: () => void;
}

export function MobileNav({ onMoreClick }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button
        onClick={onMoreClick}
        className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <MoreHorizontal className="h-5 w-5" />
        <span>More</span>
      </button>
    </nav>
  );
}
