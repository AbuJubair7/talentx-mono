"use client";

import { ChevronDown, Download, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminDashboard, DashboardRange } from "../types/admin-dashboard";
import { downloadCsv } from "../utils/export-report";

// Props for the export menu: the loaded dashboard (null while loading) and the selected range.
interface ExportMenuProps {
  data: AdminDashboard | null;
  range: DashboardRange;
  disabled: boolean;
}

// The Export button: download the dashboard as CSV, or print / save it as PDF.
export function ExportMenu({ data, range, disabled }: ExportMenuProps) {
  // Saves the CSV and confirms with the file name, or reports the failure.
  const handleCsv = () => {
    if (!data) return;
    try {
      const fileName = downloadCsv(data, range);
      toast.success("Report exported", { description: fileName });
    } catch {
      toast.error("Couldn't export the report", { description: "Please try again." });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || !data}
        className="inline-flex h-9 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-600 px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="size-4" aria-hidden="true" />
        Export
        <ChevronDown className="size-3.5 opacity-80" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={handleCsv}>
          <FileSpreadsheet className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
          <span>
            <span className="block">Download CSV</span>
            <span className="block text-xs font-normal text-zinc-500">All metrics and tables for this range</span>
          </span>
        </DropdownMenuItem>
        {/* Deferred so the menu has closed before the print dialog captures the page. */}
        <DropdownMenuItem onClick={() => window.setTimeout(() => window.print(), 50)}>
          <Printer className="size-4 shrink-0 text-zinc-500" aria-hidden="true" />
          <span>
            <span className="block">Print or save as PDF</span>
            <span className="block text-xs font-normal text-zinc-500">A snapshot of this page</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
