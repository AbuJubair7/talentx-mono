"use client";

import { ArrowRight, Briefcase, Building2, Inbox, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";
import { VERIFICATION_STATUS_LABELS } from "../constants/dashboard.constants";
import type {
  DashboardActivity,
  DashboardActivityType,
  DashboardVerificationStatus,
} from "../types/admin-dashboard";
import { DashboardPanel } from "./DashboardPanel";

// Which activities the feed is showing: all of them, or one type.
type ActivityFilter = "All" | DashboardActivityType;

// Props for the feed: the recent activities and the range in words.
interface RecentActivityProps {
  activities: DashboardActivity[];
  rangeLabel: string;
}

// The filter tabs, in display order.
const FILTERS: readonly { key: ActivityFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Talent", label: "Talents" },
  { key: "Employer", label: "Employers" },
  { key: "Job", label: "Jobs" },
];

// Icon and action wording for each activity type.
const TYPE_META: Record<DashboardActivityType, { action: string; icon: LucideIcon }> = {
  Talent: { action: "Talent registered", icon: UserRound },
  Employer: { action: "Employer registered", icon: Building2 },
  Job: { action: "Job published", icon: Briefcase },
};

// Badge colours for an employer's verification status.
const VERIFICATION_BADGE_CLASSES: Record<DashboardVerificationStatus, string> = {
  Verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  PendingVerification: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

// The newest registrations and published jobs in the range, with tabs to show one type.
export function RecentActivity({ activities, rangeLabel }: RecentActivityProps) {
  const [filter, setFilter] = useState<ActivityFilter>("All");

  const visible = filter === "All" ? activities : activities.filter((activity) => activity.type === filter);
  const countFor = (key: ActivityFilter) =>
    key === "All" ? activities.length : activities.filter((activity) => activity.type === key).length;

  return (
    <DashboardPanel
      id="recent-activity"
      title="Recent platform activity"
      description={`Newest talents, employers and published jobs in the ${rangeLabel}`}
      action={
        <Link
          href="/admin/audit-log"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          View more
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {/* Scrolls sideways when the tabs don't fit. The divider is an inset shadow, not a border, so the selected
          tab's underline can cover it without spilling outside the scroll box. */}
      <div
        role="tablist"
        aria-label="Filter activity"
        className="-mt-1 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-zinc-200)] [scrollbar-width:none] dark:shadow-[inset_0_-1px_0_var(--color-slate-800)] [&::-webkit-scrollbar]:hidden"
      >
        {FILTERS.map((option) => {
          const isSelected = filter === option.key;
          return (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="recent-activity-list"
              onClick={() => setFilter(option.key)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 pb-2.5 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900",
                isSelected
                  ? "border-slate-950 text-zinc-900 dark:border-slate-100 dark:text-slate-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-slate-100"
              )}
            >
              {option.label}
              <span className="rounded-full bg-zinc-100 px-1.5 text-xs tabular-nums text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
                {countFor(option.key)}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div
          id="recent-activity-list"
          role="tabpanel"
          className="flex flex-1 flex-col items-center justify-center py-12 text-center"
        >
          <Inbox className="size-6 text-zinc-400 dark:text-slate-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-slate-100">No activity in the {rangeLabel}</p>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-slate-400">Try a wider date range.</p>
        </div>
      ) : (
        <ul id="recent-activity-list" role="tabpanel" className="divide-y divide-zinc-200/80 dark:divide-slate-800">
          {visible.map((activity) => {
            const { action, icon: Icon } = TYPE_META[activity.type];
            return (
              <li key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="min-w-0 truncate font-medium text-zinc-900 dark:text-slate-100">{activity.title}</span>
                    {activity.verificationStatus && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          VERIFICATION_BADGE_CLASSES[activity.verificationStatus]
                        )}
                      >
                        {VERIFICATION_STATUS_LABELS[activity.verificationStatus]}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[13px] text-zinc-500 dark:text-slate-400">
                    {action}
                    {activity.detail && ` · ${activity.detail}`}
                  </p>
                </div>
                <time
                  dateTime={activity.occurredAt}
                  className="shrink-0 whitespace-nowrap text-[13px] tabular-nums text-zinc-500 dark:text-slate-400"
                >
                  {timeAgo(activity.occurredAt)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
}
