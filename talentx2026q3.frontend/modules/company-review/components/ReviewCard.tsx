import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMonthYear, formatShortDate } from '@/lib/date';
import { RATING_AREAS, REVIEW_SENTIMENT_LABELS } from '../constants/company-review.constants';
import type {
  CompanyReviewRatingsDto,
  CompanyReviewStatus,
  ReviewSentiment,
} from '../types/company-review.types';
import { RatingStars } from './RatingStars';
import { ReviewStatusBadge } from './ReviewStatusBadge';

interface ReviewCardProps {
  sentiment: ReviewSentiment;
  comment: string | null;
  ratings: CompanyReviewRatingsDto;
  date?: string | null;
  /** `monthYear` keeps the exact day private (public pages). */
  dateStyle?: 'short' | 'monthYear';
  /** Shown only where the audience is allowed to see it (the talent, the employer). */
  jobTitle?: string;
  /** Shown only where moderation state is relevant. */
  status?: CompanyReviewStatus;
  className?: string;
}

export function ReviewCard({
  sentiment,
  comment,
  ratings,
  date,
  dateStyle = 'short',
  jobTitle,
  status,
  className,
}: ReviewCardProps) {
  const isPositive = sentiment === 'Positive';
  const SentimentIcon = isPositive ? ThumbsUp : ThumbsDown;
  const ratedAreas = RATING_AREAS.filter((area) => ratings[area.key] !== null);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-semibold',
              isPositive ? 'text-emerald-700' : 'text-rose-700'
            )}
          >
            <SentimentIcon className="size-4" aria-hidden="true" />
            {REVIEW_SENTIMENT_LABELS[sentiment]}
          </span>
          {jobTitle && (
            <span className="break-words text-sm font-medium text-slate-700 [overflow-wrap:anywhere]">
              {jobTitle}
            </span>
          )}
          {date && (
            <span className="text-xs text-slate-500">
              {dateStyle === 'monthYear' ? formatMonthYear(date) : formatShortDate(date)}
            </span>
          )}
        </div>
        {status && <ReviewStatusBadge status={status} />}
      </div>

      {comment && (
        <p className="break-words text-sm leading-6 whitespace-pre-line text-slate-700 [overflow-wrap:anywhere]">
          {comment}
        </p>
      )}

      {ratedAreas.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {ratedAreas.map((area) => (
            <div key={area.key} className="flex items-center justify-between gap-3">
              <dt className="text-xs font-medium text-slate-500">{area.label}</dt>
              <dd>
                <RatingStars value={ratings[area.key]} size="sm" />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
