import { RATING_AREAS } from '@/modules/company-review';
import type { CompanyReviewRatingsDto, CompanyReviewSummaryDto } from '@/modules/company-review';

/** Average of the category averages that have at least one rating; 0 if none do. */
export function overallSummaryAverage(summary: CompanyReviewSummaryDto): number {
  const rated = RATING_AREAS.map((area) => summary[area.key]).filter((area) => area.ratingCount > 0);
  if (rated.length === 0) return 0;
  return rated.reduce((total, area) => total + (area.average ?? 0), 0) / rated.length;
}

/** Average of one review's own rated categories; 0 if none are rated. */
export function reviewAverage(ratings: CompanyReviewRatingsDto): number {
  const values = RATING_AREAS.map((area) => ratings[area.key]).filter((value): value is number => value !== null);
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function formatScore(value: number): string {
  return value.toFixed(1);
}

/** Tailwind fill color for a 1–5 score, used for mini rating bars. */
export function scoreTone(value: number): string {
  if (value >= 4) return 'bg-emerald-500';
  if (value >= 3) return 'bg-amber-500';
  return 'bg-rose-500';
}
