import { Briefcase, ThumbsDown, ThumbsUp } from 'lucide-react';
import { formatShortDate } from '@/lib/date';
import { timeAgo } from '@/lib/time';
import { RATING_AREAS, RatingStars, ReviewStatusBadge } from '@/modules/company-review';
import type { EmployerCompanyReviewDto } from '../types/employer-reviews.types';
import { formatScore, reviewAverage, scoreTone } from '../utils/employer-reviews.utils';

interface EmployerReviewCardProps {
  review: EmployerCompanyReviewDto;
}

/** One anonymized review in the employer's list — no reviewer identity, no action buttons. */
export function EmployerReviewCard({ review }: EmployerReviewCardProps) {
  const isPositive = review.sentiment === 'Positive';
  const SentimentIcon = isPositive ? ThumbsUp : ThumbsDown;
  const ratedAreas = RATING_AREAS.filter((area) => review.ratings[area.key] !== null);
  const average = reviewAverage(review.ratings);
  const hasRatings = ratedAreas.length > 0;

  return (
    <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xs sm:p-6 md:grid-cols-[1fr_auto]">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
              isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            <SentimentIcon className="size-3" aria-hidden="true" />
            {review.sentiment}
          </span>
          <ReviewStatusBadge status={review.status} />
          <span className="text-xs text-slate-300" aria-hidden="true">
            ·
          </span>
          <time dateTime={review.submittedAt} className="text-xs text-slate-400">
            Submitted {formatShortDate(review.submittedAt)}
          </time>
        </div>

        <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
          <Briefcase className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="min-w-0 truncate">Applied for {review.jobTitle}</span>
        </h3>

        {review.comment && (
          <p className="max-w-3xl break-words text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
            {review.comment}
          </p>
        )}

        {hasRatings && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1 sm:grid-cols-4">
            {ratedAreas.map((area) => {
              const value = review.ratings[area.key] as number;

              return (
                <div key={area.key}>
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-slate-400">{area.label}</dt>
                    <dd className="font-medium tabular-nums text-slate-700">{value}</dd>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${scoreTone(value)}`}
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </dl>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 md:w-40 md:flex-col md:items-end md:justify-start md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <div className="md:text-right">
          <p className="text-2xl font-bold tabular-nums text-slate-900">
            {hasRatings ? formatScore(average) : '—'}
          </p>
          <div className="mt-1">
            <RatingStars value={hasRatings ? average : null} size="sm" />
          </div>
        </div>
        {review.updatedAt && <p className="text-xs text-slate-400 md:mt-auto">Updated {timeAgo(review.updatedAt)}</p>}
      </div>
    </div>
  );
}
