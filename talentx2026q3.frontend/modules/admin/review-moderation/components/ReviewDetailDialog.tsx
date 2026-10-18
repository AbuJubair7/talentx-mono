"use client";

import Link from "next/link";
import { Loader2, MessageSquareWarning, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/date";
import type { ApiError } from "@/lib/api/axios";
import { RATING_AREAS, RatingStars, ReviewStatusBadge } from "@/modules/company-review";
import { REVIEW_MODERATION_REASON_LABELS } from "@/modules/company-review";
import { useAdminCompanyReviewDetails } from "../hooks/useAdminCompanyReviewDetails";

interface ReviewDetailDialogProps {
  reviewId: string | null;
  onClose: () => void;
}

// Dialog with everything an admin needs to see about one review: full comment, every rating
// area, the reviewer's identity, and the last moderation decision.
export function ReviewDetailDialog({ reviewId, onClose }: ReviewDetailDialogProps) {
  const isOpen = reviewId !== null;
  const { data: review, isPending, isError, error, refetch } = useAdminCompanyReviewDetails(reviewId ?? undefined);
  const isNotFound = (error as ApiError | null)?.status === 404;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0 border-zinc-200 shadow-2xl rounded-2xl bg-white dark:border-slate-800 dark:bg-slate-900">
        <DialogHeader className="flex flex-row items-start justify-between gap-4 px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/80 shrink-0 pr-12 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <MessageSquareWarning className="size-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold tracking-tight text-zinc-900 dark:text-slate-100">
                {review?.companyName ?? "Review Details"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-slate-400">
                {review?.jobTitle ?? "Review the comment, ratings and moderation history"}
              </DialogDescription>
            </div>
          </div>

          {review && (
            <div className="shrink-0">
              <ReviewStatusBadge status={review.status} />
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isPending && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400 dark:text-slate-500">
              <Loader2 className="size-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-zinc-600 dark:text-slate-300">Loading review details…</p>
            </div>
          )}

          {isError && isNotFound && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="text-sm font-semibold text-zinc-800 dark:text-slate-200">
                This review isn&apos;t available anymore
              </p>
              <p className="max-w-sm text-xs text-zinc-500 dark:text-slate-400">
                It may have been removed along with the reviewer&apos;s or company&apos;s account.
              </p>
            </div>
          )}

          {isError && !isNotFound && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Couldn&apos;t load review details</p>
              <p className="max-w-sm text-xs text-zinc-500 dark:text-slate-400">
                {(error as { message?: string })?.message ?? "Please try again."}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-2xs transition-colors hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw className="size-3.5 text-zinc-500" />
                Retry
              </button>
            </div>
          )}

          {review && (
            <div className="space-y-6">
              <section className="rounded-xl border border-zinc-200 p-4 dark:border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  Reviewer
                </h4>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-slate-200">
                      {review.reviewerName}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-slate-400">{review.reviewerEmail}</p>
                  </div>
                  {review.reviewerUserId && (
                    <Link
                      href="/admin/users"
                      className="shrink-0 whitespace-nowrap text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      View in User Management
                    </Link>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  Comment
                </h4>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-slate-300">
                  {review.comment || "No comment was written."}
                </p>
              </section>

              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                  Ratings
                </h4>
                <dl className="mt-2 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {RATING_AREAS.map((area) => {
                    const value = review.ratings[area.key];
                    return (
                      <div key={area.key} className="flex items-center justify-between gap-3">
                        <dt className="text-sm text-zinc-600 dark:text-slate-400">{area.label}</dt>
                        <dd>
                          <RatingStars value={value} size="sm" />
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>

              {(review.status === "Rejected" || review.status === "Hidden") && review.moderationReason && (
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Last moderation decision
                  </h4>
                  <p className="mt-2 text-sm font-medium text-amber-900 dark:text-amber-200">
                    {REVIEW_MODERATION_REASON_LABELS[review.moderationReason]}
                  </p>
                  {review.moderationDetails && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800 dark:text-amber-300">
                      {review.moderationDetails}
                    </p>
                  )}
                  {review.moderatedAt && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                      {formatDateTime(review.moderatedAt)}
                      {review.moderatedByEmail ? ` · ${review.moderatedByEmail}` : ""}
                    </p>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
