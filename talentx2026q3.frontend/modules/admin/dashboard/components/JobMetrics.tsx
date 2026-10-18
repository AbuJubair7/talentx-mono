"use client";

import { Briefcase } from "lucide-react";
import type { DashboardMetrics } from "../types/admin-dashboard";
import { formatNumber, formatPercent, share } from "../utils/format";
import { NewInRange } from "./PeopleMetrics";

// Props for the jobs card: in-range and all-time counts, and the range in words.
interface JobMetricsProps {
  metrics: DashboardMetrics;
  totals: DashboardMetrics;
  rangeLabel: string;
}

// One slice of the jobs status bar and its legend entry.
interface JobSegment {
  key: string;
  label: string;
  count: number;
  colorClass: string;
}

// The jobs card: all-time total on the left, a status bar and legend on the right.
export function JobMetrics({ metrics, totals, rangeLabel }: JobMetricsProps) {
  // Deactivated is red and under review amber, as in the job moderation badges.
  const segments: JobSegment[] = [
    { key: "active", label: "Active", count: totals.publishedJobs, colorClass: "bg-emerald-600" },
    { key: "closed", label: "Closed / expired", count: totals.closedOrExpiredJobs, colorClass: "bg-slate-400" },
    { key: "deactivated", label: "Deactivated", count: totals.deactivatedJobs, colorClass: "bg-rose-500" },
    { key: "review", label: "Under review", count: totals.underReviewJobs, colorClass: "bg-amber-500" },
  ];
  const total = totals.totalJobs;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-xs backdrop-blur-xs lg:flex-row lg:items-center dark:border-slate-800 dark:bg-slate-900/95">
      <div className="shrink-0 lg:w-56">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
            <Briefcase className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-zinc-600 dark:text-slate-300">Total jobs</span>
        </div>
        <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-slate-100">
          {formatNumber(total)}
        </p>
        <div className="mt-2">
          <NewInRange count={metrics.totalJobs} rangeLabel={rangeLabel} verb="posted" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div
          role="img"
          aria-label={segments.map((segment) => `${segment.label}: ${segment.count}`).join(", ")}
          className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800"
        >
          {segments
            .filter((segment) => segment.count > 0)
            .map((segment) => (
              <div
                key={segment.key}
                className={`h-full ${segment.colorClass}`}
                style={{ width: `${share(segment.count, total)}%` }}
              />
            ))}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {segments.map((segment) => (
            <div key={segment.key} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-slate-400">
                <span className={`size-2 shrink-0 rounded-full ${segment.colorClass}`} aria-hidden="true" />
                {segment.label}
              </dt>
              <dd className="mt-1 text-lg font-bold tabular-nums text-zinc-900 dark:text-slate-100">
                {formatNumber(segment.count)}
              </dd>
              <dd className="text-xs tabular-nums text-zinc-500 dark:text-slate-400">
                {formatPercent(share(segment.count, total))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
