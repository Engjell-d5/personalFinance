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
} from "@/services/google-auth";

type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());
  const [message, setMessage] = useState<string>();
  const [connected, setConnected] = useState(false);
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
        const reconnected = await trySilentSignIn();
        setConnected(reconnected || isSignedIn());
        if (reconnected) {
          sync();
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
    } catch {
      setConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    googleSignOut();
    setConnected(false);
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
    gsiReady,
    passphraseSet,
    connect,
    disconnect,
    setPassphrase,
    syncNow,
  };
}
