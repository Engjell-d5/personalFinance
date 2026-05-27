import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuid } from "uuid";
import { db } from "@/db/index";
import type { RecurringRule } from "@/lib/types";

export function useRecurringRules() {
  const rules = useLiveQuery(async () => {
    const results = await db.recurringRules.toArray();
    return results.filter((r) => !r.deletedAt);
  });

  async function addRule(
    data: Omit<RecurringRule, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    await db.recurringRules.add({
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async function updateRule(id: string, data: Partial<RecurringRule>) {
    await db.recurringRules.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async function deleteRule(id: string) {
    await db.recurringRules.update(id, {
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: false,
    });
  }

  return {
    rules: rules ?? [],
    addRule,
    updateRule,
    deleteRule,
  };
}
