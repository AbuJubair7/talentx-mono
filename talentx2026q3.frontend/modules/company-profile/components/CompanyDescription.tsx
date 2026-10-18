'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Descriptions longer than this are collapsed behind a Show more toggle. */
export const LONG_DESCRIPTION_THRESHOLD = 1000;

interface CompanyDescriptionProps {
  description: string;
  className?: string;
}

/**
 * Company "About" text: always justified. Long descriptions (>1000 chars)
 * start collapsed with a bottom fade + "Show more" button, so it is always
 * obvious that more content exists. Expanded with "Show less". Used by both
 * the public profile and employer pages.
 */
export function CompanyDescription({ description, className }: CompanyDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > LONG_DESCRIPTION_THRESHOLD;

  if (!isLong) {
    return (
      <div className={cn('text-justify whitespace-pre-line', className)}>{description}</div>
    );
  }

  return (
    <div>
      <div className="relative">
        <div
          className={cn(
            'text-justify whitespace-pre-line',
            !expanded && 'max-h-96 overflow-hidden',
            className,
          )}
        >
          {description}
        </div>
        {!expanded && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Show less of the company description' : 'Show more of the company description'}
        className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
      >
        {expanded ? 'Show less' : 'Show more'}
        {expanded ? (
          <ChevronUp className="size-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
