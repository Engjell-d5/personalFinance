import { Button } from "@/components/ui/button";
import { Cloud, X } from "lucide-react";
import { useSync } from "@/hooks/useSync";
import { useState } from "react";

export function ReconnectBanner() {
  const { connected, wasConnected, gsiReady, status, connect } = useSync();
  const [dismissed, setDismissed] = useState(false);

  if (!gsiReady || connected || !wasConnected || dismissed) return null;
  if (status === "syncing") return null;

  return (
    <div className="sticky top-14 z-20 flex items-center justify-between gap-3 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Cloud className="h-4 w-4 text-yellow-700 dark:text-yellow-400 flex-shrink-0" />
        <span className="text-xs text-yellow-900 dark:text-yellow-200 truncate">
          Google Drive disconnected — reconnect to sync your data
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button size="sm" variant="default" className="h-7 text-xs" onClick={connect}>
          Reconnect
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
