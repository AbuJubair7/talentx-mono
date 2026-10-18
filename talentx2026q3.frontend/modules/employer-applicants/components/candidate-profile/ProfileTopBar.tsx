import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ProfileTopBarProps {
  backHref: string;
  position: number | null;
  total: number | null;
  prevHref: string | null;
  nextHref: string | null;
}

const navButtonClass =
  'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[13px] font-medium text-ink-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';
const navEnabledClass = 'hover:bg-canvas hover:text-ink';
const navDisabledClass = 'cursor-not-allowed text-ink-subtle/60';

export function ProfileTopBar({ backHref, position, total, prevHref, nextHref }: ProfileTopBarProps) {
  return (
    <nav aria-label="Candidate navigation" className="flex items-center justify-between gap-4">
      <Link
        href={backHref}
        className="group -ml-1 inline-flex items-center gap-1 rounded-md px-1 py-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <ChevronLeft className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden="true" />
        Back to applicants
      </Link>

      <div className="flex items-center gap-1">
        {prevHref ? (
          <Link href={prevHref} aria-label="Previous candidate" className={cn(navButtonClass, navEnabledClass)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <span aria-disabled="true" className={cn(navButtonClass, navDisabledClass)}>
            <ChevronLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </span>
        )}

        {position !== null && total !== null && (
          <span className="px-2 text-[13px] tabular-nums text-ink-subtle" aria-live="polite">
            <span className="font-medium text-ink">{position}</span> of {total}
          </span>
        )}

        {nextHref ? (
          <Link href={nextHref} aria-label="Next candidate" className={cn(navButtonClass, navEnabledClass)}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span aria-disabled="true" className={cn(navButtonClass, navDisabledClass)}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
