"use client";

import { cn } from "@/lib/utils";
import { DASHBOARD_RANGES } from "../constants/dashboard.constants";
import type { DashboardRange } from "../types/admin-dashboard";

// What the picker needs from its parent: the selected preset and a way to change it.
interface DateRangeSelectProps {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
}

// The segmented control that lets the admin choose the window (24H, 7D, 30D, 90D, 12M) every dashboard number
// covers. It is a radio group, so exactly one preset is always selected and screen readers announce it that way;
// picking one just reports the choice, and the page re-fetches for it.
export function DateRangeSelect({ value, onChange }: DateRangeSelectProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Date range"
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
    >
      {DASHBOARD_RANGES.map((range) => {
        const isSelected = range.key === value;
        return (
          <button
            key={range.key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            title={range.longLabel}
            onClick={() => onChange(range.key)}
            className={cn(
              "cursor-pointer rounded-sm px-3 py-1.5 text-sm font-medium tabular-nums outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
              isSelected
                ? "bg-slate-950 font-semibold text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            )}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
