import { Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncStatusIndicatorProps {
  status: "idle" | "syncing" | "success" | "error" | "offline";
  message?: string;
  connected: boolean;
  onClick?: () => void;
}

export function SyncStatusIndicator({
  status,
  message,
  connected,
  onClick,
}: SyncStatusIndicatorProps) {
  if (!connected) return null;

  const config = {
    idle: {
      icon: Cloud,
      text: "Synced",
      className: "text-muted-foreground",
    },
    syncing: {
      icon: Loader2,
      text: "Syncing...",
      className: "text-blue-500",
    },
    success: {
      icon: CheckCircle2,
      text: "Synced",
      className: "text-green-500",
    },
    error: {
      icon: AlertCircle,
      text: message ?? "Sync error",
      className: "text-red-500",
    },
    offline: {
      icon: CloudOff,
      text: "Offline",
      className: "text-yellow-500",
    },
  };

  const { icon: Icon, text, className } = config[status];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-accent transition-colors",
        className
      )}
      title={text}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          status === "syncing" && "animate-spin"
        )}
      />
      <span className="hidden sm:inline max-w-24 truncate">{text}</span>
    </button>
  );
}
