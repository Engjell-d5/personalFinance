import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import type { Budget, Category } from "@/lib/types";

interface BudgetCardProps {
  budget: Budget;
  category: Category;
  spent: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export function BudgetCard({
  budget,
  category,
  spent,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - spent;
  const isOver = remaining < 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color ?? "#737373" }}
            />
            <span className="font-medium text-sm">{category.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {budget.period}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(budget)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(budget)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(spent)} / {formatCurrency(budget.amount)}
            </span>
          </div>
          <Progress value={spent} max={budget.amount} />
          <p
            className={cn(
              "text-xs",
              isOver
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
            )}
          >
            {Math.round(percentage)}%
            {isOver
              ? ` · ${formatCurrency(Math.abs(remaining))} over`
              : ` · ${formatCurrency(remaining)} remaining`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
