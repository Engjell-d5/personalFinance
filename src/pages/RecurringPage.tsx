import { useState, useMemo } from "react";
import { Plus, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RecurringRuleForm } from "@/components/recurring/RecurringRuleForm";
import { RecurringRuleCard } from "@/components/recurring/RecurringRuleCard";
import { useRecurringRules } from "@/hooks/useRecurring";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/format";
import type { RecurringRule, TransactionType } from "@/lib/types";

/** Normalize any frequency amount to a monthly equivalent. */
function toMonthly(amount: number, frequency: string): number {
  switch (frequency) {
    case "daily":
      return amount * 30;
    case "weekly":
      return amount * 4.33;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

export function RecurringPage() {
  const { rules, addRule, updateRule, deleteRule } = useRecurringRules();
  const categories = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringRule | undefined>();
  const [tab, setTab] = useState<"all" | TransactionType>("all");

  const activeCount = useMemo(
    () => rules.filter((r) => r.isActive).length,
    [rules]
  );

  const filteredRules = useMemo(() => {
    if (tab === "all") return rules;
    return rules.filter((r) => r.type === tab);
  }, [rules, tab]);

  const { monthlyIncome, monthlyExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const r of rules) {
      if (!r.isActive) continue;
      const monthly = toMonthly(r.amount, r.frequency);
      if (r.type === "income") income += monthly;
      else expenses += monthly;
    }
    return { monthlyIncome: income, monthlyExpenses: expenses };
  }, [rules]);

  function handleEdit(rule: RecurringRule) {
    setEditing(rule);
    setFormOpen(true);
  }

  function handleClose() {
    setFormOpen(false);
    setEditing(undefined);
  }

  async function handleToggle(id: string, isActive: boolean) {
    await updateRule(id, { isActive });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {activeCount} active rule{activeCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Rule
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-lg font-semibold text-green-600">
              +{formatCurrency(monthlyIncome)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <span className="text-lg font-semibold">
              -{formatCurrency(monthlyExpenses)}
            </span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Filter Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expense</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-3 space-y-3">
          {filteredRules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarOff className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">
                  No recurring rules yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create your first rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRules.map((rule) => (
              <RecurringRuleCard
                key={rule.id}
                rule={rule}
                categories={categories}
                onEdit={handleEdit}
                onDelete={deleteRule}
                onToggle={handleToggle}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Form dialog */}
      <RecurringRuleForm
        open={formOpen}
        onClose={handleClose}
        initial={editing}
        onSubmit={async (data) => {
          if (editing) {
            await updateRule(editing.id, data);
          } else {
            await addRule(data);
          }
        }}
      />
    </div>
  );
}
