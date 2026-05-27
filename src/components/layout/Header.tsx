import { Moon, Sun, Menu, Download } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import { useSync } from "@/hooks/useSync";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { status, message, connected, syncNow } = useSync();
  const { canInstall, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-md hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {canInstall && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-primary hover:bg-accent transition-colors"
            title="Install app"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        <SyncStatusIndicator
          status={status}
          message={message}
          connected={connected}
          onClick={syncNow}
        />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-accent"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
