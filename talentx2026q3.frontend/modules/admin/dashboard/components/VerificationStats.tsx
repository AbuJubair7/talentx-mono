"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import {
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../constants/dashboard.constants";
import type { DashboardVerificationStatus, StatusCount } from "../types/admin-dashboard";
import { formatNumber } from "../utils/format";
import { DashboardPanel } from "./DashboardPanel";
import { StatusDonut } from "./StatusDonut";

// What the panel needs: how many employers are in each verification status in the range, how many employers are
// waiting for a decision in total, and how long the oldest one has waited. The last two cover the whole queue, not
// just the range, because a request waiting for review matters whenever it was made.
interface VerificationStatsProps {
  statuses: StatusCount<DashboardVerificationStatus>[];
  awaitingCount: number;
  oldestPendingDays: number | null;
  rangeLabel: string;
}

// Answers "how healthy is employer onboarding?" as a donut of Verified, Pending and Rejected employers registered in the
// range. When anyone is still waiting for review anywhere in the queue, it adds a call-to-action stating how many are
// waiting, how long the oldest request has waited and a link straight to the review page, so the admin can act on it.
export function VerificationStats({
  statuses,
  awaitingCount,
  oldestPendingDays,
  rangeLabel,
}: VerificationStatsProps) {
  const segments = statuses.map((entry) => ({
    key: entry.status,
    label: VERIFICATION_STATUS_LABELS[entry.status],
    value: entry.count,
    color: VERIFICATION_STATUS_COLORS[entry.status],
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <DashboardPanel
      id="verification-stats"
      title="Employer verification"
      description={`${formatNumber(total)} employers registered in the ${rangeLabel}`}
    >
      <StatusDonut segments={segments} centerLabel="Employers" ariaLabel="Employer verification status breakdown" />

      {awaitingCount > 0 && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-medium text-zinc-900 dark:text-slate-100">
            {formatNumber(awaitingCount)} {awaitingCount === 1 ? "employer is" : "employers are"} awaiting review
          </p>
          {oldestPendingDays !== null && (
            <p className="mt-0.5 flex items-center gap-1 text-[13px] text-amber-700 dark:text-amber-400">
              <Clock className="size-3.5" aria-hidden="true" />
              Oldest request waiting {oldestPendingDays} {oldestPendingDays === 1 ? "day" : "days"}
            </p>
          )}
          <Link
            href="/admin/employers"
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Review queue
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </DashboardPanel>
  );
}
