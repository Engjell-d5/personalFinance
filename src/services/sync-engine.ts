import { db } from "@/db/index";
import { getAccessToken, isSignedIn } from "./google-auth";
import { findSyncFile, downloadFile, uploadNewFile, updateFile } from "./google-drive";
import { encrypt, decrypt, hashData } from "./crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = any;

interface SyncPayload {
  version: 1;
  exportedAt: string;
  deviceId: string;
  data: {
    transactions: AnyRecord[];
    recurringRules: AnyRecord[];
    categories: AnyRecord[];
    assets: AnyRecord[];
    tenants: AnyRecord[];
    maintenanceRecords: AnyRecord[];
    accounts: AnyRecord[];
    budgets: AnyRecord[];
  };
}

type SyncStatus = "idle" | "syncing" | "success" | "error" | "offline";

type SyncListener = (status: SyncStatus, message?: string) => void;

const listeners = new Set<SyncListener>();

let currentStatus: SyncStatus = "idle";

export function onSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

function emit(status: SyncStatus, message?: string) {
  currentStatus = status;
  for (const listener of listeners) {
    listener(status, message);
  }
}

function getDeviceId(): string {
  let id = localStorage.getItem("pf-device-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("pf-device-id", id);
  }
  return id;
}

function getPassphrase(): string | null {
  return localStorage.getItem("pf-sync-passphrase");
}

export function setPassphrase(passphrase: string) {
  localStorage.setItem("pf-sync-passphrase", passphrase);
}

export function hasPassphrase(): boolean {
  return !!getPassphrase();
}

async function exportDatabase(): Promise<SyncPayload> {
  const [
    transactions,
    recurringRules,
    categories,
    assets,
    tenants,
    maintenanceRecords,
    accounts,
    budgets,
  ] = await Promise.all([
    db.transactions.toArray(),
    db.recurringRules.toArray(),
    db.categories.toArray(),
    db.assets.toArray(),
    db.tenants.toArray(),
    db.maintenanceRecords.toArray(),
    db.accounts.toArray(),
    db.budgets.toArray(),
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    data: {
      transactions,
      recurringRules,
      categories,
      assets,
      tenants,
      maintenanceRecords,
      accounts,
      budgets,
    },
  };
}

function mergeRecords(
  local: AnyRecord[],
  remote: AnyRecord[]
): AnyRecord[] {
  const merged = new Map<string, AnyRecord>();

  for (const record of local) {
    merged.set(record.id, record);
  }

  for (const record of remote) {
    const id = record.id as string;
    const existing = merged.get(id);

    if (!existing) {
      merged.set(id, record);
    } else {
      const localUpdated = (existing.updatedAt ?? existing.createdAt ?? "") as string;
      const remoteUpdated = (record.updatedAt ?? record.createdAt ?? "") as string;

      if (remoteUpdated >= localUpdated) {
        merged.set(id, record);
      }
    }
  }

  return Array.from(merged.values());
}

function mergePayloads(local: SyncPayload, remote: SyncPayload): SyncPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    data: {
      transactions: mergeRecords(local.data.transactions, remote.data.transactions),
      recurringRules: mergeRecords(local.data.recurringRules, remote.data.recurringRules),
      categories: mergeRecords(local.data.categories, remote.data.categories),
      assets: mergeRecords(local.data.assets, remote.data.assets),
      tenants: mergeRecords(local.data.tenants, remote.data.tenants),
      maintenanceRecords: mergeRecords(local.data.maintenanceRecords, remote.data.maintenanceRecords),
      accounts: mergeRecords(local.data.accounts ?? [], remote.data.accounts ?? []),
      budgets: mergeRecords(local.data.budgets ?? [], remote.data.budgets ?? []),
    },
  };
}

async function importDatabase(payload: SyncPayload): Promise<void> {
  const tables = [
    db.transactions,
    db.recurringRules,
    db.categories,
    db.assets,
    db.tenants,
    db.maintenanceRecords,
    db.accounts,
    db.budgets,
  ];

  await db.transaction("rw", tables, async () => {
    await db.transactions.clear();
    await db.recurringRules.clear();
    await db.categories.clear();
    await db.assets.clear();
    await db.tenants.clear();
    await db.maintenanceRecords.clear();
    await db.accounts.clear();
    await db.budgets.clear();

    await db.transactions.bulkAdd(payload.data.transactions);
    await db.recurringRules.bulkAdd(payload.data.recurringRules);
    await db.categories.bulkAdd(payload.data.categories);
    await db.assets.bulkAdd(payload.data.assets);
    await db.tenants.bulkAdd(payload.data.tenants);
    await db.maintenanceRecords.bulkAdd(payload.data.maintenanceRecords);
    if (payload.data.accounts) {
      await db.accounts.bulkAdd(payload.data.accounts);
    }
    if (payload.data.budgets) {
      await db.budgets.bulkAdd(payload.data.budgets);
    }
  });
}

export async function sync(): Promise<void> {
  if (!navigator.onLine) {
    emit("offline");
    return;
  }

  if (!isSignedIn()) {
    emit("idle");
    return;
  }

  const passphrase = getPassphrase();
  if (!passphrase) {
    emit("error", "No encryption passphrase set");
    return;
  }

  try {
    emit("syncing");

    const token = await getAccessToken();
    const localPayload = await exportDatabase();
    const localJson = JSON.stringify(localPayload);

    const fileId = await findSyncFile(token);

    if (!fileId) {
      const encrypted = await encrypt(localJson, passphrase);
      const newFileId = await uploadNewFile(token, encrypted);
      const hash = await hashData(localJson);

      await db.syncMeta.put({
        id: "primary",
        lastSyncTimestamp: new Date().toISOString(),
        driveFileId: newFileId,
        lastRemoteHash: hash,
        conflictsResolved: 0,
      });

      emit("success");
      return;
    }

    const encryptedRemote = await downloadFile(token, fileId);
    let remotePayload: SyncPayload;

    try {
      const remoteJson = await decrypt(encryptedRemote, passphrase);
      remotePayload = JSON.parse(remoteJson);
    } catch {
      emit("error", "Failed to decrypt remote data. Check your passphrase.");
      return;
    }

    const mergedPayload = mergePayloads(localPayload, remotePayload);
    const mergedJson = JSON.stringify(mergedPayload);
    const mergedHash = await hashData(mergedJson);

    const syncMeta = await db.syncMeta.get("primary");
    if (syncMeta?.lastRemoteHash === mergedHash) {
      emit("success");
      return;
    }

    await importDatabase(mergedPayload);

    const encrypted = await encrypt(mergedJson, passphrase);
    await updateFile(token, fileId, encrypted);

    await db.syncMeta.put({
      id: "primary",
      lastSyncTimestamp: new Date().toISOString(),
      driveFileId: fileId,
      lastRemoteHash: mergedHash,
      conflictsResolved: (syncMeta?.conflictsResolved ?? 0),
    });

    emit("success");
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Sync failed";
    emit("error", msg);
  }
}
