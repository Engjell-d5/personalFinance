import Dexie, { type Table } from "dexie";
import type {
  Transaction,
  RecurringRule,
  Category,
  Asset,
  Tenant,
  MaintenanceRecord,
  Account,
  SyncMeta,
} from "@/lib/types";

export class FinanceDB extends Dexie {
  transactions!: Table<Transaction>;
  recurringRules!: Table<RecurringRule>;
  categories!: Table<Category>;
  assets!: Table<Asset>;
  tenants!: Table<Tenant>;
  maintenanceRecords!: Table<MaintenanceRecord>;
  accounts!: Table<Account>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super("personalFinance");

    this.version(3).stores({
      transactions:
        "id, date, categoryId, type, scope, propertyId, accountId, [scope+type], [date+type]",
      recurringRules: "id, nextDueDate, isActive",
      categories: "id, type, scope, parentId, sortOrder",
      properties: "id, isActive",
      tenants: "id, propertyId, isActive",
      maintenanceRecords: "id, propertyId, date, status",
      investments: "id, type, symbol",
      assets: "id, type, scope",
      accounts: "id, type, isActive",
      syncMeta: "id",
    });

    this.version(4)
      .stores({
        transactions:
          "id, date, categoryId, type, scope, assetId, accountId, [scope+type], [date+type]",
        recurringRules: "id, nextDueDate, isActive",
        categories: "id, type, scope, parentId, sortOrder",
        assets: "id, category, scope, isActive",
        tenants: "id, assetId, isActive",
        maintenanceRecords: "id, assetId, date, status",
        accounts: "id, type, isActive",
        syncMeta: "id",
        properties: null,
        investments: null,
      })
      .upgrade(async (tx) => {
        const properties = await tx.table("properties").toArray();
        const investments = await tx.table("investments").toArray();
        const oldAssets = await tx.table("assets").toArray();
        const now = new Date().toISOString();

        const idMap = new Map<string, string>();

        const newAssets: Asset[] = [];

        for (const p of properties) {
          const newId = p.id;
          idMap.set(p.id, newId);
          newAssets.push({
            id: newId,
            name: p.name,
            category: "real_estate",
            scope: "personal",
            purchasePrice: p.purchasePrice,
            currentValue: p.currentValue,
            address: p.address,
            monthlyMortgage: p.monthlyMortgage,
            propertyStatus: p.status,
            notes: p.notes,
            isActive: p.isActive ?? true,
            createdAt: p.createdAt ?? now,
            updatedAt: p.updatedAt ?? now,
            deletedAt: p.deletedAt,
          });
        }

        for (const inv of investments) {
          newAssets.push({
            id: inv.id,
            name: inv.name,
            category: "investment",
            scope: "personal",
            purchasePrice: inv.purchasePrice * inv.units,
            currentValue: inv.currentPrice * inv.units,
            purchaseDate: inv.purchaseDate,
            symbol: inv.symbol,
            investmentType: inv.type,
            units: inv.units,
            currentPrice: inv.currentPrice,
            notes: inv.notes,
            isActive: true,
            createdAt: inv.createdAt ?? now,
            updatedAt: inv.updatedAt ?? now,
            deletedAt: inv.deletedAt,
          });
        }

        for (const a of oldAssets) {
          newAssets.push({
            id: a.id,
            name: a.name,
            category: a.type === "real_estate" ? "real_estate" : a.type === "vehicle" ? "vehicle" : a.type === "equipment" ? "equipment" : "other",
            scope: a.scope,
            purchasePrice: a.purchasePrice,
            currentValue: a.currentValue,
            purchaseDate: a.purchaseDate,
            depreciationRate: a.depreciationRate,
            description: a.description,
            notes: a.notes,
            isActive: true,
            createdAt: a.createdAt ?? now,
            updatedAt: a.updatedAt ?? now,
            deletedAt: a.deletedAt,
          } as Asset);
        }

        await tx.table("assets").clear();
        if (newAssets.length > 0) {
          await tx.table("assets").bulkAdd(newAssets);
        }

        const allTx = await tx.table("transactions").toArray();
        for (const t of allTx) {
          if (t.propertyId) {
            const newAssetId = idMap.get(t.propertyId) ?? t.propertyId;
            await tx.table("transactions").update(t.id, { assetId: newAssetId });
          }
        }

        const allTenants = await tx.table("tenants").toArray();
        for (const t of allTenants) {
          if (t.propertyId) {
            const newAssetId = idMap.get(t.propertyId) ?? t.propertyId;
            await tx.table("tenants").update(t.id, { assetId: newAssetId });
          }
        }

        const allMaint = await tx.table("maintenanceRecords").toArray();
        for (const m of allMaint) {
          if (m.propertyId) {
            const newAssetId = idMap.get(m.propertyId) ?? m.propertyId;
            await tx
              .table("maintenanceRecords")
              .update(m.id, { assetId: newAssetId });
          }
        }
      });
  }
}

export const db = new FinanceDB();
