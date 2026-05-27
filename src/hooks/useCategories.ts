import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/index";
import type { TransactionType, Scope } from "@/lib/types";

export function useCategories(type?: TransactionType, scope?: Scope) {
  const categories = useLiveQuery(async () => {
    let results = await db.categories.orderBy("sortOrder").toArray();

    if (type) {
      results = results.filter((c) => c.type === type);
    }
    if (scope) {
      results = results.filter((c) => c.scope === scope);
    }

    return results;
  }, [type, scope]);

  return categories ?? [];
}
