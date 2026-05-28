import { useState, useEffect, useCallback } from "react";
import {
  sync,
  onSyncStatus,
  getSyncStatus,
  setPassphrase as storePassphrase,
  hasPassphrase,
} from "@/services/sync-engine";
import {
  loadGsi,
  initAuth,
  signIn as googleSignIn,
  signOut as googleSignOut,
  isSignedIn,
  trySilentSignIn,
  wasPreviouslyConnected,
} from "@/services/google-auth";

type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

let silentAttempted = false;

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());
  const [message, setMessage] = useState<string>();
  const [connected, setConnected] = useState(false);
  const [wasConnected, setWasConnected] = useState(wasPreviouslyConnected());
  const [gsiReady, setGsiReady] = useState(false);
  const [passphraseSet, setPassphraseSet] = useState(hasPassphrase());

  useEffect(() => {
    const unsubscribe = onSyncStatus((s, msg) => {
      setStatus(s);
      setMessage(msg);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadGsi()
      .then(async () => {
        initAuth();
        setGsiReady(true);

        if (isSignedIn()) {
          setConnected(true);
          return;
        }

        if (!silentAttempted && wasPreviouslyConnected()) {
          silentAttempted = true;
          const ok = await trySilentSignIn();
          if (ok) {
            setConnected(true);
            sync();
          }
        }
      })
      .catch(() => {
        setGsiReady(false);
      });
  }, []);

  const connect = useCallback(async () => {
    try {
      await googleSignIn();
      setConnected(true);
      setWasConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    googleSignOut();
    setConnected(false);
    setWasConnected(false);
  }, []);

  const setPassphrase = useCallback((passphrase: string) => {
    storePassphrase(passphrase);
    setPassphraseSet(true);
  }, []);

  const syncNow = useCallback(async () => {
    await sync();
  }, []);

  return {
    status,
    message,
    connected,
    wasConnected,
    gsiReady,
    passphraseSet,
    connect,
    disconnect,
    setPassphrase,
    syncNow,
  };
}
