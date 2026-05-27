import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db } from "@/db/index";
import type { Asset, AssetCategory } from "@/lib/types";

export function useAssets(category?: AssetCategory) {
  const assets = useLiveQuery(async () => {
    let results = await db.assets.toArray();
    results = results.filter((a) => !a.deletedAt);
    if (category) {
      results = results.filter((a) => a.category === category);
    }
    return results;
  }, [category]);

  async function addAsset(
    data: Omit<Asset, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    await db.assets.add({
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateAsset(id: string, data: Partial<Asset>) {
    await db.assets.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteAsset(id: string) {
    await db.assets.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    assets: assets ?? [],
    addAsset,
    updateAsset,
    deleteAsset,
  };
}

export function useAsset(id: string | undefined) {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    const asset = await db.assets.get(id);
    if (asset?.deletedAt) return undefined;
    return asset;
  }, [id]);
}
