'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompanyListItem } from '../types/company-list.types';
import { CompanyCard } from './CompanyCard';

interface CompanyListResult {
  items: CompanyListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface CompanyListViewProps {
  result: CompanyListResult;
  hasFilters: boolean;
  onPageChange: (page: number) => void;
  onClearAll: () => void;
  /** True while a refetch is running (sorting, filtering, paging). */
  isUpdating?: boolean;
}

export function CompanyListView({
  result,
  hasFilters,
  onPageChange,
  onClearAll,
  isUpdating = false,
}: CompanyListViewProps) {
  const topRef = useRef<HTMLDivElement>(null);

  const { items, totalCount, page, pageSize } = result;
  const totalPages = Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    onPageChange(next);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    topRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center sm:py-20">
        <SearchX className="size-8 text-slate-300" aria-hidden="true" />
        <p className="text-base font-bold text-slate-900">
          {hasFilters ? 'No companies match your filters' : 'No companies yet'}
        </p>
        <p className="max-w-md text-sm text-slate-500">
          {hasFilters
            ? 'Try removing a filter or searching with a different keyword.'
            : 'Companies will appear here once they join.'}
        </p>
        {hasFilters && (
          <Button
            type="button"
            onClick={onClearAll}
            className="mt-2 cursor-pointer rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-4 space-y-6">
      <ul
        aria-busy={isUpdating}
        className={`grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${
          isUpdating ? 'opacity-60' : ''
        }`}
      >
        {items.map((company) => (
          <li key={company.id} className="h-full">
            <CompanyCard company={company} />
          </li>
        ))}
      </ul>

      {/* Pagination Bar matching Browse Jobs page */}
      {(hasPrev || hasNext) && (
        <div className="flex items-center justify-between pt-5 border-t border-slate-200">
          <Button
            variant="outline"
            className="gap-1.5 text-xs sm:text-sm font-semibold border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
            onClick={() => goToPage(page - 1)}
            disabled={!hasPrev}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <span className="text-xs text-slate-500 font-medium">
            Page{' '}
            <span className="font-mono font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-mono font-bold text-slate-900">{totalPages}</span>
          </span>

          <Button
            variant="outline"
            className="gap-1.5 text-xs sm:text-sm font-semibold border-slate-200 hover:bg-slate-50 rounded-md cursor-pointer"
            onClick={() => goToPage(page + 1)}
            disabled={!hasNext}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}