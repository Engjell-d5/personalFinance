import { db } from "@/db/index";
import { v4 as uuid } from "uuid";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import type { RecurrenceFrequency, Transaction } from "@/lib/types";

function advanceDate(date: Date, frequency: RecurrenceFrequency): Date {
  switch (frequency) {
    case "daily":
      return addDays(date, 1);
    case "weekly":
      return addWeeks(date, 1);
    case "monthly":
      return addMonths(date, 1);
    case "quarterly":
      return addMonths(date, 3);
    case "yearly":
      return addYears(date, 1);
  }
}

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0]!;
}

export async function processRecurringRules() {
  const today = toDateStr(new Date());
  const rules = await db.recurringRules
    .where("isActive")
    .equals(1)
    .toArray();

  const activeRules = rules.filter(
    (r) => !r.deletedAt && r.nextDueDate <= today
  );

  for (const rule of activeRules) {
    let nextDue = new Date(rule.nextDueDate);
    const now = new Date().toISOString();
    const transactions: Transaction[] = [];

    while (toDateStr(nextDue) <= today) {
      if (rule.endDate && toDateStr(nextDue) > rule.endDate) break;

      transactions.push({
        id: uuid(),
        date: toDateStr(nextDue),
        amount: rule.amount,
        type: rule.type,
        scope: rule.scope,
        categoryId: rule.categoryId,
        description: rule.description,
        propertyId: rule.propertyId,
        recurringRuleId: rule.id,
        createdAt: now,
        updatedAt: now,
      });

      nextDue = advanceDate(nextDue, rule.frequency);
    }

    await db.transaction("rw", db.transactions, db.recurringRules, async () => {
      if (transactions.length > 0) {
        await db.transactions.bulkAdd(transactions);
      }
      await db.recurringRules.update(rule.id, {
        nextDueDate: toDateStr(nextDue),
        lastGeneratedDate: today,
        updatedAt: now,
      });
    });
  }
}
