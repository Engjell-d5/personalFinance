import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db } from "@/db/index";
import type { Budget } from "@/lib/types";

export function useBudgets() {
  const budgets = useLiveQuery(async () => {
    const results = await db.budgets.toArray();
    return results.filter((b) => !b.deletedAt);
  });

  async function addBudget(
    data: Omit<Budget, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    await db.budgets.add({
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateBudget(id: string, data: Partial<Budget>) {
    await db.budgets.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteBudget(id: string) {
    await db.budgets.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    budgets: budgets ?? [],
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
