import { db } from "./index";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { v4 as uuid } from "uuid";

export async function seedDatabase() {
  const now = new Date().toISOString();

  const existingCats = await db.categories.toArray();
  const existingIds = new Set(existingCats.map((c) => c.id));

  const missing = DEFAULT_CATEGORIES
    .filter((cat) => !existingIds.has(cat.id))
    .map((cat) => ({ ...cat, createdAt: now }));

  if (missing.length > 0) {
    await db.categories.bulkAdd(missing);
  }

  const accCount = await db.accounts.count();
  if (accCount === 0) {
    await db.accounts.add({
      id: uuid(),
      name: "Main Account",
      type: "checking",
      startingBalance: 0,
      currency: "EUR",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
}
