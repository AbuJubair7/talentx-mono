'use client';

import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@/lib/errors';
import {
  EMPLOYER_REVIEW_FALLBACKS,
  EMPLOYER_REVIEW_PAGE_NUMBER,
  EMPLOYER_REVIEW_PAGE_SIZE,
  EMPTY_EMPLOYER_REVIEW_SUMMARY,
} from '../constants/employer-reviews.constants';
import { useEmployerCompanyReviewSummary } from '../hooks/useEmployerCompanyReviewSummary';
import { useEmployerCompanyReviews } from '../hooks/useEmployerCompanyReviews';
import {
  ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER,
  ALL_EMPLOYER_REVIEW_STATUS_FILTER,
} from '../types/employer-reviews.types';
import type { EmployerReviewSentimentFilter, EmployerReviewStatusFilter } from '../types/employer-reviews.types';
import { EmployerReviewCard } from './EmployerReviewCard';
import { EmployerReviewFilterToolbar } from './EmployerReviewFilterToolbar';
import { EmployerReviewStatusCounts } from './EmployerReviewStatusCounts';
import { EmployerReviewsEmpty, EmployerReviewsError, EmployerReviewsListSkeleton } from './EmployerReviewsListStates';
import { EmployerReviewsPagination } from './EmployerReviewsPagination';
import { EmployerReviewsRatingBreakdown } from './EmployerReviewsRatingBreakdown';
import { EmployerReviewsSummaryCards } from './EmployerReviewsSummaryCards';

export function EmployerReviewsView() {
  const [page, setPage] = useState(EMPLOYER_REVIEW_PAGE_NUMBER);
  const [statusFilter, setStatusFilter] = useState<EmployerReviewStatusFilter>(ALL_EMPLOYER_REVIEW_STATUS_FILTER);
  const [sentimentFilter, setSentimentFilter] = useState<EmployerReviewSentimentFilter>(
    ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER
  );

  const summaryQuery = useEmployerCompanyReviewSummary();

  const reviewsQuery = useEmployerCompanyReviews({
    status: statusFilter !== ALL_EMPLOYER_REVIEW_STATUS_FILTER ? statusFilter : undefined,
    sentiment: sentimentFilter !== ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER ? sentimentFilter : undefined,
    page,
    pageSize: EMPLOYER_REVIEW_PAGE_SIZE,
  });

  const handleStatusFilterChange = (value: EmployerReviewStatusFilter) => {
    setStatusFilter(value);
    setPage(EMPLOYER_REVIEW_PAGE_NUMBER);
  };

  const handleSentimentFilterChange = (value: EmployerReviewSentimentFilter) => {
    setSentimentFilter(value);
    setPage(EMPLOYER_REVIEW_PAGE_NUMBER);
  };

  const clearFilters = () => {
    setStatusFilter(ALL_EMPLOYER_REVIEW_STATUS_FILTER);
    setSentimentFilter(ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER);
    setPage(EMPLOYER_REVIEW_PAGE_NUMBER);
  };

  const reviews = reviewsQuery.data?.items ?? [];
  const totalPages = reviewsQuery.data?.totalPages ?? 1;
  const totalCount = reviewsQuery.data?.totalCount ?? 0;
  const isFiltered =
    statusFilter !== ALL_EMPLOYER_REVIEW_STATUS_FILTER || sentimentFilter !== ALL_EMPLOYER_REVIEW_SENTIMENT_FILTER;

  const summaryData = summaryQuery.data ?? EMPTY_EMPLOYER_REVIEW_SUMMARY;
  const totalSubmitted = Object.values(summaryData.countsByStatus).reduce((total, count) => total + count, 0);

  return (
    <div className="space-y-6">
      {summaryQuery.isPending ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((card) => (
              <Skeleton key={card} className="h-31 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </>
      ) : summaryQuery.isError ? (
        <Card className="rounded-2xl border-slate-200 p-0 shadow-xs">
          <EmployerReviewsError
            description={getErrorMessage(summaryQuery.error, EMPLOYER_REVIEW_FALLBACKS.ERROR_LOAD_SUMMARY)}
            onRetry={() => summaryQuery.refetch()}
          />
        </Card>
      ) : (
        <>
          <EmployerReviewsSummaryCards data={summaryData} totalSubmitted={totalSubmitted} />
          <div className="grid gap-4 lg:grid-cols-3">
            <EmployerReviewsRatingBreakdown summary={summaryData.summary} />
            <EmployerReviewStatusCounts counts={summaryData.countsByStatus} />
          </div>
        </>
      )}

      <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 py-0 shadow-xs">
        <CardHeader className="gap-1 border-b border-slate-100 px-6 pt-6 pb-4">
          <CardTitle className="text-sm font-semibold text-slate-900">Candidate reviews</CardTitle>
          <CardDescription>Feedback submitted by talent who interviewed with your company.</CardDescription>
          <div className="pt-4">
            <EmployerReviewFilterToolbar
              statusFilter={statusFilter}
              sentimentFilter={sentimentFilter}
              counts={summaryData.countsByStatus}
              totalSubmitted={totalSubmitted}
              onStatusFilterChange={handleStatusFilterChange}
              onSentimentFilterChange={handleSentimentFilterChange}
            />
          </div>
        </CardHeader>

        {reviewsQuery.isPending ? (
          <EmployerReviewsListSkeleton />
        ) : reviewsQuery.isError ? (
          <EmployerReviewsError
            description={getErrorMessage(reviewsQuery.error, EMPLOYER_REVIEW_FALLBACKS.ERROR_LOAD_LIST)}
            onRetry={() => reviewsQuery.refetch()}
          />
        ) : reviews.length === 0 ? (
          <EmployerReviewsEmpty filtered={isFiltered} onClearFilters={isFiltered ? clearFilters : undefined} />
        ) : (
          <>
            <div className="space-y-4 p-6" aria-busy={reviewsQuery.isFetching}>
              {reviews.map((review) => (
                <EmployerReviewCard key={review.id} review={review} />
              ))}
            </div>
            <EmployerReviewsPagination
              page={page}
              totalPages={totalPages}
              pageSize={EMPLOYER_REVIEW_PAGE_SIZE}
              totalCount={totalCount}
              isFetching={reviewsQuery.isFetching}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
