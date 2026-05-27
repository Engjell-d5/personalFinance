import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { GoogleSignInButton } from "@/components/sync/GoogleSignInButton";
import { PassphraseDialog } from "@/components/sync/PassphraseDialog";
import { useSync } from "@/hooks/useSync";
import { Cloud, Lock, RefreshCw, Download, Upload, Trash2, Eraser } from "lucide-react";
import { db } from "@/db/index";
import { seedDatabase } from "@/db/seed";

export function SettingsPage() {
  const {
    status,
    connected,
    gsiReady,
    passphraseSet,
    connect,
    disconnect,
    setPassphrase,
    syncNow,
  } = useSync();

  const [passphraseDialogOpen, setPassphraseDialogOpen] = useState(false);

  async function handleExportData() {
    const data = {
      transactions: await db.transactions.toArray(),
      recurringRules: await db.recurringRules.toArray(),
      categories: await db.categories.toArray(),
      assets: await db.assets.toArray(),
      tenants: await db.tenants.toArray(),
      maintenanceRecords: await db.maintenanceRecords.toArray(),
      accounts: await db.accounts.toArray(),
      budgets: await db.budgets.toArray(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportData() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);

      const tables = [
        db.transactions, db.recurringRules, db.categories,
        db.assets, db.tenants, db.maintenanceRecords, db.accounts, db.budgets,
      ];
      await db.transaction("rw", tables, async () => {
        if (data.transactions) {
          await db.transactions.clear();
          await db.transactions.bulkAdd(data.transactions);
        }
        if (data.recurringRules) {
          await db.recurringRules.clear();
          await db.recurringRules.bulkAdd(data.recurringRules);
        }
        if (data.categories) {
          await db.categories.clear();
          await db.categories.bulkAdd(data.categories);
        }
        if (data.assets) {
          await db.assets.clear();
          await db.assets.bulkAdd(data.assets);
        }
        if (data.tenants) {
          await db.tenants.clear();
          await db.tenants.bulkAdd(data.tenants);
        }
        if (data.maintenanceRecords) {
          await db.maintenanceRecords.clear();
          await db.maintenanceRecords.bulkAdd(data.maintenanceRecords);
        }
        if (data.accounts) {
          await db.accounts.clear();
          await db.accounts.bulkAdd(data.accounts);
        }
        if (data.budgets) {
          await db.budgets.clear();
          await db.budgets.bulkAdd(data.budgets);
        }
      });
    };
    input.click();
  }

  async function handleClearData() {
    if (!confirm("Are you sure? This will delete ALL your data.")) return;

    const allTables = [
      db.transactions, db.recurringRules, db.categories,
      db.assets, db.tenants, db.maintenanceRecords, db.accounts, db.budgets, db.syncMeta,
    ];
    await db.transaction("rw", allTables, async () => {
      await db.transactions.clear();
      await db.recurringRules.clear();
      await db.categories.clear();
      await db.assets.clear();
      await db.tenants.clear();
      await db.maintenanceRecords.clear();
      await db.accounts.clear();
      await db.budgets.clear();
      await db.syncMeta.clear();
    });

    await seedDatabase();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="h-4 w-4" />
            Google Drive Sync
          </CardTitle>
          <CardDescription>
            Sync your data across devices using your own Google Drive. Data is
            encrypted before uploading.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleSignInButton
            connected={connected}
            gsiReady={gsiReady}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          {connected && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Encryption Passphrase</p>
                    <p className="text-xs text-muted-foreground">
                      Required to encrypt/decrypt your synced data.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {passphraseSet ? (
                    <Badge variant="secondary" className="text-xs">Set</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Not set</Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPassphraseDialogOpen(true)}
                  >
                    {passphraseSet ? "Change" : "Set"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Manual Sync</p>
                  <p className="text-xs text-muted-foreground">
                    Status: {status}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncNow}
                  disabled={status === "syncing" || !passphraseSet}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1 ${status === "syncing" ? "animate-spin" : ""}`} />
                  Sync Now
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Management</CardTitle>
          <CardDescription>
            Export, import, or clear your local data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const assets = await db.assets.toArray();
                const seen = new Map<string, string>();
                const dupeIds: string[] = [];
                for (const a of assets) {
                  const key = `${a.name}|${a.category}|${a.address ?? ""}`;
                  if (seen.has(key)) {
                    dupeIds.push(a.id);
                  } else {
                    seen.set(key, a.id);
                  }
                }
                if (dupeIds.length === 0) {
                  alert("No duplicates found.");
                  return;
                }
                if (!confirm(`Found ${dupeIds.length} duplicate asset(s). Remove them?`)) return;
                await db.assets.bulkDelete(dupeIds);
                alert(`Removed ${dupeIds.length} duplicate(s).`);
              }}
            >
              <Eraser className="h-3.5 w-3.5 mr-1" />
              Remove Duplicate Assets
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Export Backup
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportData}>
              <Upload className="h-3.5 w-3.5 mr-1" />
              Import Backup
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearData}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <PassphraseDialog
        open={passphraseDialogOpen}
        onClose={() => setPassphraseDialogOpen(false)}
        onSubmit={setPassphrase}
      />
    </div>
  );
}
