"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from "../constants/dashboard.constants";
import type { DashboardJobStatus, StatusCount } from "../types/admin-dashboard";
import { formatNumber } from "../utils/format";
import { DashboardPanel } from "./DashboardPanel";
import { StatusDonut } from "./StatusDonut";

// What the panel needs: how many jobs created in the range are in each status, and how many jobs are waiting for an
// admin decision in total (the whole queue, not just the range).
interface JobStatsProps {
  statuses: StatusCount<DashboardJobStatus>[];
  awaitingCount: number;
  rangeLabel: string;
}

// Answers "what state are the platform's jobs in?" as a donut of Published, Closed, Expired, Deactivated and Under
// review jobs created in the range. Drafts are never counted, because they are the employer's private work in progress.
// When employers have resubmitted jobs that still need a decision, it adds a call-to-action stating how many, with a
// link to the moderation page where the admin can approve or deactivate them.
export function JobStats({ statuses, awaitingCount, rangeLabel }: JobStatsProps) {
  const segments = statuses.map((entry) => ({
    key: entry.status,
    label: JOB_STATUS_LABELS[entry.status],
    value: entry.count,
    color: JOB_STATUS_COLORS[entry.status],
  }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <DashboardPanel
      id="job-stats"
      title="Jobs by status"
      description={`${formatNumber(total)} jobs created in the ${rangeLabel}`}
    >
      <StatusDonut segments={segments} centerLabel="Jobs" ariaLabel="Jobs by status breakdown" />

      {awaitingCount > 0 && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-medium text-zinc-900 dark:text-slate-100">
            {formatNumber(awaitingCount)} {awaitingCount === 1 ? "job is" : "jobs are"} awaiting review
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-amber-700 dark:text-amber-400">
            <Clock className="size-3.5" aria-hidden="true" />
            Resubmitted by employers after a deactivation
          </p>
          <Link
            href="/admin/jobs"
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
