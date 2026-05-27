import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db } from "@/db/index";
import type { Account } from "@/lib/types";

export function useAccounts() {
  const accounts = useLiveQuery(async () => {
    const results = await db.accounts.toArray();
    return results.filter((a) => !a.deletedAt);
  });

  async function addAccount(
    data: Omit<Account, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    await db.accounts.add({
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateAccount(id: string, data: Partial<Account>) {
    await db.accounts.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteAccount(id: string) {
    await db.accounts.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    accounts: accounts ?? [],
    addAccount,
    updateAccount,
    deleteAccount,
  };
}
