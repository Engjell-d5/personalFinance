import { Button } from "@/components/ui/button";
import { Cloud, CloudOff } from "lucide-react";

interface GoogleSignInButtonProps {
  connected: boolean;
  gsiReady: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function GoogleSignInButton({
  connected,
  gsiReady,
  onConnect,
  onDisconnect,
}: GoogleSignInButtonProps) {
  if (!gsiReady) {
    return (
      <div className="text-sm text-muted-foreground">
        Google Drive sync requires a configured OAuth Client ID.
        Set <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code> in your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file.
      </div>
    );
  }

  if (connected) {
    return (
      <Button variant="outline" onClick={onDisconnect}>
        <CloudOff className="h-4 w-4 mr-2" />
        Disconnect Google Drive
      </Button>
    );
  }

  return (
    <Button onClick={onConnect}>
      <Cloud className="h-4 w-4 mr-2" />
      Connect Google Drive
    </Button>
  );
}
