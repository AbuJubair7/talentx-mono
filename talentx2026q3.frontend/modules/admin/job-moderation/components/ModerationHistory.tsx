import { formatToLocalTime } from "@/modules/admin/audit-log/utils/format-timestamp";
import type { JobModerationAction, JobModerationHistoryEntry } from "../types/job-moderation";

const ACTION_CONFIG: Record<JobModerationAction, { label: string; dotClassName: string }> = {
  Deactivated: { label: "Deactivated", dotClassName: "bg-rose-500" },
  ResubmittedForReview: { label: "Resubmitted for review", dotClassName: "bg-amber-500" },
  Reactivated: { label: "Reactivated", dotClassName: "bg-emerald-500" },
};

interface ModerationHistoryProps {
  entries: JobModerationHistoryEntry[];
}

// Newest-first timeline of every admin moderation action taken on a job.
export function ModerationHistory({ entries }: ModerationHistoryProps) {
  // Sorted here rather than trusting the API order, so the latest action is always on top.
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-slate-100">Moderation history</h3>

      {sortedEntries.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-slate-400">No moderation actions yet.</p>
      ) : (
        <ol className="space-y-4 border-l border-zinc-200 pl-4 dark:border-slate-800">
          {sortedEntries.map((entry) => {
            const { label, dotClassName } = ACTION_CONFIG[entry.action];
            return (
              <li key={entry.id} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[21px] top-1.5 size-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${dotClassName}`}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-slate-200">{label}</p>
                  <p
                    suppressHydrationWarning
                    className="whitespace-nowrap font-mono text-xs text-zinc-500 dark:text-slate-400"
                  >
                    {formatToLocalTime(entry.createdAt)}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-slate-400">by {entry.actorEmail}</p>
                {entry.action === "Deactivated" && entry.reasonLabel && (
                  <div className="mt-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-slate-800/60">
                    <p className="font-medium text-zinc-700 dark:text-slate-300">{entry.reasonLabel}</p>
                    {entry.details && (
                      <p className="mt-0.5 whitespace-pre-line break-words text-zinc-600 dark:text-slate-400">
                        {entry.details}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
