import { cn } from '@/lib/utils';
import { RATING_AREAS } from '../constants/company-review.constants';
import type { CompanyReviewSummaryDto } from '../types/company-review.types';
import { RatingStars } from './RatingStars';

interface CompanyReviewSummaryCardProps {
  summary: CompanyReviewSummaryDto;
  title?: string;
  /** A short line under the title, e.g. "Summary reflects published reviews only." */
  note?: string;
  className?: string;
}

export function CompanyReviewSummaryCard({
  summary,
  title = 'Hiring experience',
  note,
  className,
}: CompanyReviewSummaryCardProps) {
  const hasReviews = summary.totalCount > 0;

  return (
    <section
      aria-label={title}
      className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6', className)}
    >
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}

      {!hasReviews ? (
        <p className="mt-4 text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-2xl font-bold text-slate-900">
                {summary.positivePercent}%{' '}
                <span className="text-sm font-medium text-slate-500">positive</span>
              </p>
              <p className="text-xs text-slate-500">
                Based on {summary.totalCount} review{summary.totalCount === 1 ? '' : 's'}
              </p>
            </div>

            <div
              role="img"
              aria-label={`${summary.positiveCount} positive, ${summary.negativeCount} negative`}
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
            >
              <div className="bg-emerald-500" style={{ width: `${summary.positivePercent}%` }} />
              <div className="bg-rose-400" style={{ width: `${100 - summary.positivePercent}%` }} />
            </div>

            <p className="text-xs text-slate-500">
              {summary.positiveCount} positive · {summary.negativeCount} negative
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-3">
            {RATING_AREAS.map((area) => {
              const { average } = summary[area.key];

              return (
                <div key={area.key} className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-medium text-slate-700">{area.label}</dt>
                  <dd className="flex items-center gap-2">
                    {average === null ? (
                      <span className="text-xs text-slate-400">Not rated yet</span>
                    ) : (
                      <>
                        <RatingStars value={average} size="sm" />
                        <span className="w-7 text-right text-sm font-semibold text-slate-900">
                          {average.toFixed(1)}
                        </span>
                      </>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </section>
  );
}
