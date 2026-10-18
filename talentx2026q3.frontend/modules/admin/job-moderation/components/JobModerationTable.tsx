import { formatShortDate } from "@/lib/date";
import type { AdminJobListItem } from "../types/job-moderation";
import { isRelisted, postedDate } from "../utils/publish-dates";
import { ModerationStatusBadge } from "./ModerationStatusBadge";

interface JobModerationTableProps {
  items: AdminJobListItem[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  // Rows become clickable only when a handler is given.
  onView?: (id: string) => void;
}

const COLUMN_COUNT = 6;

// Table for the admin job list: loading/error/empty states and clickable rows.
export function JobModerationTable({ items, isLoading, isError = false, onRetry, onView }: JobModerationTableProps) {
  return (
    <table className="w-full min-w-[880px] text-left text-sm">
      <thead className="sticky top-0 z-10 border-b border-zinc-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
          <th className="px-5 py-3.5 font-semibold">Job</th>
          <th className="px-5 py-3.5 font-semibold">Employer</th>
          <th className="px-5 py-3.5 font-semibold">Status</th>
          <th className="px-5 py-3.5 font-semibold">Applicants</th>
          <th className="px-5 py-3.5 font-semibold">Posted</th>
          <th className="px-5 py-3.5 font-semibold">Expires</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50 dark:divide-slate-800/60">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <tr key={`skeleton-${index}`} className="animate-pulse">
              {Array.from({ length: COLUMN_COUNT }).map((__, cellIndex) => (
                <td key={cellIndex} className="px-5 py-4">
                  <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-slate-800" />
                </td>
              ))}
            </tr>
          ))
        ) : isError ? (
          <tr>
            <td colSpan={COLUMN_COUNT} className="h-32 text-center text-sm text-zinc-500 dark:text-slate-400">
              <p>Couldn&apos;t load jobs.</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2 cursor-pointer font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Try again
                </button>
              )}
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={COLUMN_COUNT} className="h-32 text-center text-sm text-zinc-500 dark:text-slate-400">
              No matching jobs found.
            </td>
          </tr>
        ) : (
          items.map((job) => {
            const isClickable = Boolean(onView);
            return (
              <tr
                key={job.id}
                {...(isClickable && {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": `View details for ${job.title}`,
                  onClick: () => onView?.(job.id),
                  onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onView?.(job.id);
                    }
                  },
                })}
                className={
                  isClickable
                    ? "cursor-pointer outline-none transition-colors hover:bg-zinc-50/60 focus-visible:bg-zinc-50/60 dark:hover:bg-slate-800/40 dark:focus-visible:bg-slate-800/40"
                    : undefined
                }
              >
                <td className="px-5 py-4 max-w-[280px] min-w-0">
                  <p className="truncate font-medium text-zinc-800 dark:text-slate-200" title={job.title}>{job.title}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-slate-400" title={job.companyName}>{job.companyName}</p>
                </td>
                <td className="px-5 py-4 max-w-[220px] min-w-0">
                  {job.employerName || job.employerEmail ? (
                    <>
                      <p className="truncate text-zinc-800 dark:text-slate-200" title={job.employerName}>{job.employerName}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-slate-400" title={job.employerEmail}>{job.employerEmail}</p>
                    </>
                  ) : (
                    // The backend returns empty strings when the employer's user record is gone.
                    <p className="text-xs italic text-zinc-400 dark:text-slate-500">Account not found</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <ModerationStatusBadge status={job.status} isExpired={job.isExpired} />
                </td>
                <td className="px-5 py-4 text-zinc-600 dark:text-slate-400">{job.applicantCount}</td>
                <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-slate-400">
                  {formatShortDate(postedDate(job), "—")}
                  {/* Only for jobs that came back online, so most rows keep a single date. */}
                  {isRelisted(job) && (
                    <p className="text-xs text-zinc-400 dark:text-slate-500">
                      Relisted {formatShortDate(job.publishedAt, "—")}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-zinc-600 dark:text-slate-400">
                  {formatShortDate(job.expireAt, "—")}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
