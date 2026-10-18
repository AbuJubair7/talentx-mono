import { AlertTriangle } from "lucide-react";
import { formatToLocalTime } from "@/modules/admin/audit-log/utils/format-timestamp";
import type { ModerationStatus } from "../types/job-moderation";

interface DeactivationReasonPanelProps {
  status: ModerationStatus;
  reasonLabel: string | null;
  details: string | null;
  deactivatedAt: string | null;
}

// Shows the current deactivation reason, details and date for a job.
export function DeactivationReasonPanel({ status, reasonLabel, details, deactivatedAt }: DeactivationReasonPanelProps) {
  // The backend clears the reason on reactivation, so a missing label means the job isn't down.
  if (!reasonLabel) return null;

  return (
    <section
      aria-label="Deactivation reason"
      className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-500/30 dark:bg-rose-500/10"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            Deactivated: {reasonLabel}
          </p>
          {details && (
            <p className="whitespace-pre-line break-words text-sm text-rose-900/80 dark:text-rose-200/80">{details}</p>
          )}
          {deactivatedAt && (
            <p suppressHydrationWarning className="font-mono text-xs text-rose-700/70 dark:text-rose-300/70">
              {formatToLocalTime(deactivatedAt)}
            </p>
          )}
        </div>
      </div>

      {status === "PendingReview" && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          The employer edited and resubmitted this job. Review the changes below before approving.
        </p>
      )}
    </section>
  );
}
