import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, CalendarClock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecurringRule, Category } from "@/lib/types";

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

interface RecurringRuleCardProps {
  rule: RecurringRule;
  categories: Category[];
  onEdit: (rule: RecurringRule) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

export function RecurringRuleCard({
  rule,
  categories,
  onEdit,
  onDelete,
  onToggle,
}: RecurringRuleCardProps) {
  const category = categories.find((c) => c.id === rule.categoryId);

  return (
    <Card
      className={cn(
        "transition-opacity",
        !rule.isActive && "opacity-60"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{rule.description}</span>
            <Badge variant="secondary">
              {frequencyLabels[rule.frequency] ?? rule.frequency}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {rule.scope}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            {category && <span>{category.name}</span>}
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Next: {formatDate(rule.nextDueDate)}
            </span>
          </div>
        </div>

        <span
          className={cn(
            "text-base font-semibold whitespace-nowrap",
            rule.type === "income" ? "text-green-600" : "text-foreground"
          )}
        >
          {rule.type === "income" ? "+" : "-"}
          {formatCurrency(rule.amount)}
        </span>

        <div className="flex items-center gap-1.5">
          <Switch
            checked={rule.isActive}
            onCheckedChange={(checked) => onToggle(rule.id, checked)}
            aria-label="Toggle active"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(rule)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(rule.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
