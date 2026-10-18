"use client";

import { AlertTriangle, RotateCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PortalPageContainer, PortalPageHeader } from "@/components/layout";
import { cn } from "@/lib/utils";
import { DASHBOARD_RANGES, DEFAULT_DASHBOARD_RANGE } from "../constants/dashboard.constants";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import type { DashboardRange } from "../types/admin-dashboard";
import { formatRangeSpan } from "../utils/format";
import { ApplicationStats } from "./ApplicationStats";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DateRangeSelect } from "./DateRangeSelect";
import { ExportMenu } from "./ExportMenu";
import { JobStats } from "./JobStats";
import { KeyMetrics } from "./KeyMetrics";
import { RecentActivity } from "./RecentActivity";
import { TrendChart } from "./TrendChart";
import { VerificationStats } from "./VerificationStats";

// The Admin Dashboard page body. It owns the one piece of state that drives everything, the selected date range,
// asks the backend for that window, and lays out whatever comes back. It also decides what the admin sees while
// waiting or when something fails: a skeleton on first load, a dimmed page while a new range loads, and an error
// banner with a Retry button if the request fails.
export function AdminDashboardView() {
  const [range, setRange] = useState<DashboardRange>(DEFAULT_DASHBOARD_RANGE);
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useAdminDashboard(range);

  const rangeConfig = DASHBOARD_RANGES.find((candidate) => candidate.key === range) ?? DASHBOARD_RANGES[0];
  const rangeLabel = rangeConfig.longLabel.toLowerCase();

  return (
    <PortalPageContainer className="admin-dashboard-print">
      <PortalPageHeader
        title="Admin Dashboard"
        subtitle={
          data
            ? `Platform overview · ${formatRangeSpan(data.startDate, data.endDate)}`
            : "Platform overview, active metrics, and administrative status."
        }
        actions={
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <span
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              title="Figures are computed on the server and are visible to admins only."
            >
              <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
              Admin-only data
            </span>
            <DateRangeSelect value={range} onChange={setRange} />
            <ExportMenu data={data ?? null} range={range} disabled={isFetching} />
          </div>
        }
      />

      <div aria-busy={isFetching}>
        <span className="sr-only" aria-live="polite">
          {isFetching ? "Loading dashboard…" : "Dashboard updated"}
        </span>

        {isError && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10"
          >
            <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <p className="flex-1 text-sm text-zinc-900 dark:text-slate-100">
              We couldn&apos;t load the dashboard data for this range.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCw className="size-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {isLoading && !data && <DashboardSkeleton />}

        {data && (
          <div
            data-testid="dashboard-content"
            className={cn("space-y-6 transition-opacity duration-200", isPlaceholderData ? "opacity-60" : "opacity-100")}
          >
            <KeyMetrics metrics={data.metrics} totals={data.totals} rangeLabel={rangeLabel} />

            <TrendChart trend={data.trend} rangeLabel={rangeLabel} comparisonLabel={rangeConfig.previousLabel} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ApplicationStats statuses={data.applicationStatuses} rangeLabel={rangeLabel} />
              <VerificationStats
                statuses={data.verificationStatuses}
                awaitingCount={data.totals.pendingEmployerVerifications}
                oldestPendingDays={data.oldestPendingDays}
                rangeLabel={rangeLabel}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <JobStats
                statuses={data.jobStatuses}
                awaitingCount={data.totals.underReviewJobs}
                rangeLabel={rangeLabel}
              />
              <RecentActivity activities={data.activities} rangeLabel={rangeLabel} />
            </div>
          </div>
        )}
      </div>
    </PortalPageContainer>
  );
}
