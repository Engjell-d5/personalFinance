import { useCallback } from "react";
import { Download, FileSpreadsheet, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction, Category } from "@/lib/types";

interface ExportButtonProps {
  transactions: Transaction[];
  categories: Category[];
}

export function ExportButton({ transactions, categories }: ExportButtonProps) {
  const categoryMap = new Map<string, Category>();
  for (const cat of categories) {
    categoryMap.set(cat.id, cat);
  }

  const triggerDownload = useCallback(
    (content: string, filename: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const exportCSV = useCallback(() => {
    const header = "Date,Description,Category,Type,Scope,Amount";
    const rows = transactions.map((t) => {
      const categoryName = categoryMap.get(t.categoryId)?.name ?? "Unknown";
      // Escape fields that might contain commas or quotes
      const escape = (str: string) => {
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      return [
        t.date,
        escape(t.description),
        escape(categoryName),
        t.type,
        t.scope,
        t.amount.toFixed(2),
      ].join(",");
    });

    const csv = [header, ...rows].join("\n");
    triggerDownload(csv, "transactions.csv", "text/csv;charset=utf-8;");
  }, [transactions, categoryMap, triggerDownload]);

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(transactions, null, 2);
    triggerDownload(json, "transactions.json", "application/json");
  }, [transactions, triggerDownload]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
