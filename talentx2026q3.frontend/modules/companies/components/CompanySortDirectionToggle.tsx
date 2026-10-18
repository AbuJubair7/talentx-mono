'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanySortDir } from '../types/company-list.types';

interface CompanySortDirectionToggleProps {
  sortDir: CompanySortDir;
  onToggle: () => void;
  className?: string;
}

/**
 * Flips the sort direction (lowest-to-highest ↔ highest-to-lowest) for
 * whichever sort field is currently active.
 */
export function CompanySortDirectionToggle({
  sortDir,
  onToggle,
  className,
}: CompanySortDirectionToggleProps) {
  const ascending = (sortDir ?? 'asc') === 'asc';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={ascending ? 'Sort highest to lowest' : 'Sort lowest to highest'}
      title={ascending ? 'Highest to lowest' : 'Lowest to highest'}
      aria-pressed={!ascending}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-500/50 hover:text-emerald-700 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600',
        className,
      )}
    >
      {ascending ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
      {ascending ? 'Lowest to highest' : 'Highest to lowest'}
    </button>
  );
}
