import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferForm } from "@/components/transfers/TransferForm";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Package,
} from "lucide-react";

const linkActions = [
  {
    to: "/expenses",
    icon: ArrowDownCircle,
    label: "Add Expense",
    color: "text-red-500",
  },
  {
    to: "/income",
    icon: ArrowUpCircle,
    label: "Add Income",
    color: "text-green-500",
  },
  {
    to: "/assets",
    icon: Package,
    label: "Assets",
    color: "text-blue-500",
  },
];

export function QuickActions() {
  const [transferOpen, setTransferOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {linkActions.map((action) => (
            <Button
              key={action.to}
              variant="outline"
              className="h-auto py-3 flex flex-col gap-1.5"
              asChild
            >
              <Link to={action.to}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="text-xs">{action.label}</span>
              </Link>
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col gap-1.5"
            onClick={() => setTransferOpen(true)}
          >
            <ArrowRightLeft className="h-5 w-5 text-purple-500" />
            <span className="text-xs">Transfer</span>
          </Button>
        </div>
      </CardContent>

      <TransferForm
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onComplete={() => {}}
      />
    </Card>
  );
}
