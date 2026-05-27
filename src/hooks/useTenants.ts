import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db } from "@/db/index";
import type { Tenant } from "@/lib/types";

export function useTenants(assetId?: string) {
  const tenants = useLiveQuery(async () => {
    let results: Tenant[];
    if (assetId) {
      results = await db.tenants.where("assetId").equals(assetId).toArray();
    } else {
      results = await db.tenants.toArray();
    }
    return results.filter((t) => !t.deletedAt);
  }, [assetId]);

  async function addTenant(
    data: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    await db.tenants.add({
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateTenant(id: string, data: Partial<Tenant>) {
    await db.tenants.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteTenant(id: string) {
    await db.tenants.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    tenants: tenants ?? [],
    addTenant,
    updateTenant,
    deleteTenant,
  };
}
