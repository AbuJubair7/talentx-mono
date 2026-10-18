import type { ModerationStatus } from "../types/job-moderation";

type BadgeKey = ModerationStatus | "Expired";

const BADGE_CONFIG: Record<BadgeKey, { label: string; className: string }> = {
  PendingReview: {
    label: "Under review",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  },
  Deactivated: {
    label: "Deactivated",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  },
  Published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  Expired: {
    label: "Expired",
    className: "bg-zinc-100 text-zinc-600 dark:bg-slate-800 dark:text-slate-300",
  },
};

interface ModerationStatusBadgeProps {
  status: ModerationStatus;
  isExpired?: boolean;
}

// Small badge for a job's moderation status; collapses Published+expired into "Expired".
export function ModerationStatusBadge({ status, isExpired = false }: ModerationStatusBadgeProps) {
  // Expired jobs are stored as Published; without this a dead listing would look live.
  const key: BadgeKey = status === "Published" && isExpired ? "Expired" : status;
  const { label, className } = BADGE_CONFIG[key];

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
