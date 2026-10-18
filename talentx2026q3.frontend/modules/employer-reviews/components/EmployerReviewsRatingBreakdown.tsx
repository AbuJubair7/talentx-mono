import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RATING_AREAS } from '@/modules/company-review';
import type { CompanyReviewSummaryDto } from '@/modules/company-review';
import { formatScore, scoreTone } from '../utils/employer-reviews.utils';

interface EmployerReviewsRatingBreakdownProps {
  summary: CompanyReviewSummaryDto;
}

/** Average score per rating category, based on published reviews only. */
export function EmployerReviewsRatingBreakdown({ summary }: EmployerReviewsRatingBreakdownProps) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-xs lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-900">Rating breakdown</CardTitle>
        <CardDescription>Average score per category, based on published reviews only.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-5">
          {RATING_AREAS.map((area) => {
            const { average, ratingCount } = summary[area.key];
            const displayAverage = average ?? 0;

            return (
              <li key={area.key} className="grid grid-cols-[minmax(0,160px)_1fr_auto] items-center gap-4">
                <span className="truncate text-sm font-medium text-slate-700">{area.label}</span>
                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={area.label}
                  aria-valuenow={displayAverage}
                  aria-valuemin={0}
                  aria-valuemax={5}
                >
                  <div
                    className={`h-full rounded-full ${scoreTone(displayAverage)} transition-all duration-500`}
                    style={{ width: `${(displayAverage / 5) * 100}%` }}
                  />
                </div>
                <div className="flex w-28 items-baseline justify-end gap-2">
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {ratingCount > 0 ? formatScore(displayAverage) : '—'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
