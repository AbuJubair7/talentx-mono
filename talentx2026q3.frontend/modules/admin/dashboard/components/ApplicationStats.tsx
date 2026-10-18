"use client";

import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
} from "../constants/dashboard.constants";
import type { DashboardApplicationStatus, StatusCount } from "../types/admin-dashboard";
import { formatNumber, formatPercent, share } from "../utils/format";
import { DashboardPanel } from "./DashboardPanel";

// What the panel needs: how many applications submitted in the range currently sit in each status.
interface ApplicationStatsProps {
  statuses: StatusCount<DashboardApplicationStatus>[];
  rangeLabel: string;
}

// Answers "how far do applications get?" as one bar per status, in pipeline order (Applied to Rejected), with the count and
// share of all applications. Bars rather than a donut on purpose: the numbers fall steeply (many applied, few hired), and
// bars keep the small ones readable and the order visible. Under the bars, three rates summarise the funnel:
// how many reached at least Shortlisted, at least Interview, and Hired.
export function ApplicationStats({ statuses, rangeLabel }: ApplicationStatsProps) {
  const total = statuses.reduce((sum, entry) => sum + entry.count, 0);
  const countOf = (status: DashboardApplicationStatus) =>
    statuses.find((entry) => entry.status === status)?.count ?? 0;
  // The longest bar is the biggest status; at least 1 so an all-zero panel never divides by zero.
  const largest = Math.max(...statuses.map((entry) => entry.count), 1);

  const rates = [
    {
      label: "Shortlist rate",
      value: share(countOf("Shortlisted") + countOf("Interview") + countOf("Hired"), total),
    },
    { label: "Interview rate", value: share(countOf("Interview") + countOf("Hired"), total) },
    { label: "Hire rate", value: share(countOf("Hired"), total) },
  ];

  return (
    <DashboardPanel
      id="application-stats"
      title="Applications by status"
      description={`Current status of ${formatNumber(total)} applications submitted in the ${rangeLabel}`}
    >
      <ul className="mb-5 space-y-3.5">
        {statuses.map((entry) => (
          <li
            key={entry.status}
            className="grid grid-cols-[96px_1fr_64px_48px] items-center gap-3 sm:grid-cols-[112px_1fr_72px_52px]"
          >
            <span className="flex items-center gap-2 text-sm text-zinc-900 dark:text-slate-100">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: APPLICATION_STATUS_COLORS[entry.status] }}
                aria-hidden="true"
              />
              {APPLICATION_STATUS_LABELS[entry.status]}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800" aria-hidden="true">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${(entry.count / largest) * 100}%`,
                  backgroundColor: APPLICATION_STATUS_COLORS[entry.status],
                }}
              />
            </div>
            <span className="text-right text-sm font-medium tabular-nums text-zinc-900 dark:text-slate-100">
              {formatNumber(entry.count)}
            </span>
            <span className="text-right text-sm tabular-nums text-zinc-500 dark:text-slate-400">
              {formatPercent(share(entry.count, total), 0)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-zinc-200/80 pt-4 dark:border-slate-800">
        <dl className="grid grid-cols-3 gap-4">
          {rates.map((rate) => (
            <div key={rate.label}>
              <dt className="text-[13px] text-zinc-500 dark:text-slate-400">{rate.label}</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-900 dark:text-slate-100">
                {formatPercent(rate.value)}
              </dd>
            </div>
          ))}
        </dl>
        {/* These count "currently at this stage or further"; an applicant rejected after an interview no longer
            shows in the interview numerator, so this understates how many actually reached each stage. */}
        <p className="mt-3 text-xs text-zinc-400 dark:text-slate-500">
          Based on current status — an applicant rejected after reaching a stage isn&apos;t counted there.
        </p>
      </div>
    </DashboardPanel>
  );
}
