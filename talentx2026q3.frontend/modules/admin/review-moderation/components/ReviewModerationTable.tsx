import { formatShortDate } from "@/lib/date";
import { RatingStars, ReviewStatusBadge } from "@/modules/company-review";
import type { AdminCompanyReviewListItem } from "../types/review-moderation";

interface ReviewModerationTableProps {
  items: AdminCompanyReviewListItem[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onView: (id: string) => void;
  onApprove: (item: AdminCompanyReviewListItem) => void;
  onReject: (item: AdminCompanyReviewListItem) => void;
  onHide: (item: AdminCompanyReviewListItem) => void;
  onUnhide: (item: AdminCompanyReviewListItem) => void;
}

const COLUMN_COUNT = 7;

function averageRating(ratings: AdminCompanyReviewListItem["ratings"]): number | null {
  const values = Object.values(ratings).filter((value): value is number => value !== null);
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const SENTIMENT_STYLES: Record<AdminCompanyReviewListItem["sentiment"], string> = {
  Positive: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Negative: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

// Table for the admin review list: loading/error/empty states, clickable rows, and row
// actions that vary by moderation status.
export function ReviewModerationTable({
  items,
  isLoading,
  isError = false,
  onRetry,
  onView,
  onApprove,
  onReject,
  onHide,
  onUnhide,
}: ReviewModerationTableProps) {
  return (
    <table className="w-full min-w-[960px] text-left text-sm">
      <thead className="sticky top-0 z-10 border-b border-zinc-100 bg-white dark:border-slate-800 dark:bg-slate-900">
        <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
          <th className="px-5 py-3.5 font-semibold">Company / Job</th>
          <th className="px-5 py-3.5 font-semibold">Sentiment</th>
          <th className="px-5 py-3.5 font-semibold">Comment</th>
          <th className="px-5 py-3.5 font-semibold">Ratings</th>
          <th className="px-5 py-3.5 font-semibold">Reviewer</th>
          <th className="px-5 py-3.5 font-semibold">Status / Submitted</th>
          <th className="px-5 py-3.5 font-semibold text-right">Action</th>
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
              <p>Couldn&apos;t load reviews.</p>
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
              No matching reviews found.
            </td>
          </tr>
        ) : (
          items.map((review) => {
            const avgRating = averageRating(review.ratings);
            return (
              <tr
                key={review.id}
                role="button"
                tabIndex={0}
                aria-label={`View details for review of ${review.companyName}`}
                onClick={() => onView(review.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView(review.id);
                  }
                }}
                className="cursor-pointer outline-none transition-colors hover:bg-zinc-50/60 focus-visible:bg-zinc-50/60 dark:hover:bg-slate-800/40 dark:focus-visible:bg-slate-800/40"
              >
                <td className="px-5 py-4 max-w-[200px]">
                  <p className="truncate font-medium text-zinc-800 dark:text-slate-200">{review.companyName}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-slate-400">{review.jobTitle}</p>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${SENTIMENT_STYLES[review.sentiment]}`}
                  >
                    {review.sentiment}
                  </span>
                </td>
                <td className="max-w-[220px] px-5 py-4">
                  <p className="truncate text-zinc-600 dark:text-slate-400">{review.comment || "—"}</p>
                </td>
                <td className="px-5 py-4">
                  <RatingStars value={avgRating} size="sm" />
                </td>
                <td className="px-5 py-4">
                  <p className="truncate text-zinc-800 dark:text-slate-200">{review.reviewerName}</p>
                  <p className="truncate text-xs text-zinc-500 dark:text-slate-400">{review.reviewerEmail}</p>
                </td>
                <td className="px-5 py-4">
                  <ReviewStatusBadge status={review.status} />
                  <p className="mt-1 whitespace-nowrap text-xs text-zinc-500 dark:text-slate-400">
                    {formatShortDate(review.submittedAt, "—")}
                  </p>
                </td>
                <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    {review.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(review)}
                          className="cursor-pointer rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(review)}
                          className="cursor-pointer rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {review.status === "Published" && (
                      <button
                        type="button"
                        onClick={() => onHide(review)}
                        className="cursor-pointer rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        Hide
                      </button>
                    )}
                    {review.status === "Hidden" && (
                      <button
                        type="button"
                        onClick={() => onUnhide(review)}
                        className="cursor-pointer rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                      >
                        Unhide
                      </button>
                    )}
                    {(review.status === "Rejected" || review.status === "Withdrawn") && (
                      <span className="text-xs text-zinc-400 dark:text-slate-500">View only</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
