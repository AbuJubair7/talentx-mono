'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import { StateBoundary } from '@/components/common/states';
import { getErrorMessage } from '@/lib/errors';
import {
  COMPANY_REVIEW_FALLBACKS,
  COMPANY_REVIEW_PAGE_NUMBER,
  COMPANY_REVIEW_PAGE_SIZE,
} from '../constants/company-review.constants';
import { useMyCompanyReviews } from '../hooks/useMyCompanyReviews';
import { TalentReviewRow } from './TalentReviewRow';

type StatusFilter = 'all' | 'actionable' | 'submitted' | 'locked';

/** The Reviews tab of the talent dashboard: one row per application with an accepted interview. */
export function TalentReviewsTab() {
  const [page, setPage] = useState(COMPANY_REVIEW_PAGE_NUMBER);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, isPending, isError, error, isFetching, refetch } = useMyCompanyReviews({
    page,
    pageSize: COMPANY_REVIEW_PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  // Filter items based on search query and selected status tab
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search text match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.companyName.toLowerCase().includes(query) ||
        item.jobTitle.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Status tab match
      if (statusFilter === 'actionable') {
        return !item.review && item.canSubmit;
      }
      if (statusFilter === 'submitted') {
        return !!item.review;
      }
      if (statusFilter === 'locked') {
        return !item.review && !item.canSubmit;
      }

      return true;
    });
  }, [items, searchQuery, statusFilter]);

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <StateBoundary
        isLoading={isPending}
        isError={isError}
        isEmpty={items.length === 0}
        onRetry={() => refetch()}
        errorDescription={isError ? getErrorMessage(error, COMPANY_REVIEW_FALLBACKS.ERROR_LOAD_LIST) : undefined}
        emptyTitle="No reviews yet"
        emptyDescription="After you accept an interview, you can review the company here once it has ended."
      >
        {/* Controls Bar: Search & Status Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex max-w-sm flex-1 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs transition-all focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 shadow-2xs">
            <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company or role…"
              aria-label="Search reviews by company or role"
              className="w-full bg-transparent px-2 text-sm text-slate-900 placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer rounded-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600"
                aria-label="Clear search query"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Segmented Controls */}
          <div className="inline-flex items-center rounded-lg border border-slate-200/80 bg-slate-50 p-1 text-xs font-medium text-slate-600 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('actionable')}
              className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${
                statusFilter === 'actionable'
                  ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              Ready to Review
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('submitted')}
              className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${
                statusFilter === 'submitted'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              Submitted
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('locked')}
              className={`rounded-md px-3 py-1.5 transition-all cursor-pointer ${
                statusFilter === 'locked'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              Locked
            </button>
          </div>
        </div>

        {/* Filtered Review List */}
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <Filter className="mx-auto size-8 text-slate-400" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">No matching reviews</h3>
            <p className="mt-1 text-xs text-slate-600">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4" aria-busy={isFetching}>
            {filteredItems.map((item) => (
              <TalentReviewRow key={item.jobApplicationId} item={item} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= COMPANY_REVIEW_PAGE_NUMBER || isFetching}
              onClick={() => setPage((current) => Math.max(current - 1, COMPANY_REVIEW_PAGE_NUMBER))}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-200 hover:bg-slate-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-mono text-sm font-medium text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-200 hover:bg-slate-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {totalCount > 0 && (
          <p className="text-center text-xs font-medium text-slate-600">
            {totalCount} interview{totalCount === 1 ? '' : 's'} you can review
          </p>
        )}
      </StateBoundary>
    </div>
  );
}

