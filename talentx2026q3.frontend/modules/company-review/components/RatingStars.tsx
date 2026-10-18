'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COMPANY_REVIEW_MAX_RATING } from '../constants/company-review.constants';

interface RatingStarsProps {
  /** 1–5, or null when not rated. Fractions (averages) are rounded for display. */
  value: number | null;
  /** Providing this makes the stars interactive; without it they are read-only. */
  onChange?: (value: number | undefined) => void;
  /** Accessible name for the interactive group (e.g. the rating area). */
  label?: string;
  /** Interactive only: show a button that clears the rating back to "not rated". */
  clearable?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const STARS = Array.from({ length: COMPANY_REVIEW_MAX_RATING }, (_, index) => index + 1);

export function RatingStars({ value, onChange, label, clearable = false, size = 'md', className }: RatingStarsProps) {
  const sizeClass = size === 'sm' ? 'size-3.5' : 'size-5';
  const filled = value === null ? 0 : Math.round(value);

  if (!onChange) {
    return (
      <span
        role="img"
        aria-label={value === null ? 'Not rated' : `${value} out of ${COMPANY_REVIEW_MAX_RATING}`}
        className={cn('inline-flex items-center gap-0.5', className)}
      >
        {STARS.map((star) => (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(sizeClass, star <= filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
          />
        ))}
      </span>
    );
  }

  return (
    <div role="group" aria-label={label} className={cn('inline-flex items-center gap-1', className)}>
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} out of ${COMPANY_REVIEW_MAX_RATING}`}
          aria-pressed={value === star}
          onClick={() => onChange(star)}
          className="cursor-pointer rounded-sm p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/40"
        >
          <Star
            aria-hidden="true"
            className={cn(sizeClass, star <= filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
          />
        </button>
      ))}
      {clearable && value !== null && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="ml-1 cursor-pointer rounded-sm px-1 text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-700/40 outline-none"
        >
          Clear
        </button>
      )}
    </div>
  );
}
