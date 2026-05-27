import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db } from "@/db/index";
import type { Transaction, TransactionType, Scope } from "@/lib/types";

interface TransactionFilters {
  type?: TransactionType;
  scope?: Scope;
  categoryId?: string;
  assetId?: string;
  propertyId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const transactions = useLiveQuery(async () => {
    let collection = db.transactions.orderBy("date").reverse();

    let results = await collection.toArray();

    results = results.filter((t) => !t.deletedAt);

    if (filters.type) {
      results = results.filter((t) => t.type === filters.type);
    }
    if (filters.scope) {
      results = results.filter((t) => t.scope === filters.scope);
    }
    if (filters.categoryId) {
      results = results.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters.assetId) {
      results = results.filter((t) => t.assetId === filters.assetId || t.propertyId === filters.assetId);
    }
    if (filters.propertyId) {
      results = results.filter((t) => t.propertyId === filters.propertyId);
    }
    if (filters.accountId) {
      results = results.filter((t) => t.accountId === filters.accountId);
    }
    if (filters.startDate) {
      results = results.filter((t) => t.date >= filters.startDate!);
    }
    if (filters.endDate) {
      results = results.filter((t) => t.date <= filters.endDate!);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          t.notes?.toLowerCase().includes(term)
      );
    }

    return results;
  }, [
    filters.type,
    filters.scope,
    filters.categoryId,
    filters.assetId,
    filters.propertyId,
    filters.accountId,
    filters.startDate,
    filters.endDate,
    filters.search,
  ]);

  async function addTransaction(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    await db.transactions.add({
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateTransaction(
    id: string,
    data: Partial<Transaction>
  ) {
    await db.transactions.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteTransaction(id: string) {
    await db.transactions.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    transactions: transactions ?? [],
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
