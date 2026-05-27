import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db } from "@/db/index";
import type { MaintenanceRecord } from "@/lib/types";

export function useMaintenance(assetId?: string) {
  const records = useLiveQuery(async () => {
    let results: MaintenanceRecord[];
    if (assetId) {
      results = await db.maintenanceRecords
        .where("assetId")
        .equals(assetId)
        .toArray();
      results.sort((a, b) => (b.date > a.date ? 1 : -1));
    } else {
      results = await db.maintenanceRecords.orderBy("date").reverse().toArray();
    }
    return results.filter((r) => !r.deletedAt);
  }, [assetId]);

  async function addRecord(
    data: Omit<MaintenanceRecord, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    await db.maintenanceRecords.add({
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateRecord(id: string, data: Partial<MaintenanceRecord>) {
    await db.maintenanceRecords.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteRecord(id: string) {
    await db.maintenanceRecords.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    records: records ?? [],
    addRecord,
    updateRecord,
    deleteRecord,
  };
}
