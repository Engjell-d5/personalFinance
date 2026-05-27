import { db } from "./index";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { v4 as uuid } from "uuid";

export async function seedDatabase() {
  const now = new Date().toISOString();

  const catCount = await db.categories.count();
  if (catCount === 0) {
    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      createdAt: now,
    }));
    await db.categories.bulkAdd(categories);
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
