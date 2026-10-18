'use client';

import { Button } from '@/components/ui/button';
import { StateBoundary } from '@/components/common/states';
import { getErrorMessage } from '@/lib/errors';
import { COMPANY_REVIEW_FALLBACKS } from '../constants/company-review.constants';
import { usePublicCompanyReviews } from '../hooks/usePublicCompanyReviews';
import type { CompanyReviewSummaryDto } from '../types/company-review.types';
import { CompanyReviewSummaryCard } from './CompanyReviewSummaryCard';
import { ReviewCard } from './ReviewCard';

interface CompanyReviewsSectionProps {
  companyId: string;
  summary: CompanyReviewSummaryDto;
  className?: string;
}

/** The public company page's Reviews section: summary card + published reviews, paged via "Show more". */
export function CompanyReviewsSection({ companyId, summary, className }: CompanyReviewsSectionProps) {
  const {
    data,
    isPending,
    isError,
    error,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = usePublicCompanyReviews(companyId);

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section aria-label="Reviews" className={className}>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Reviews</h2>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <CompanyReviewSummaryCard summary={summary} note="Reflects published reviews only." />

        <div className="space-y-4">
          <StateBoundary
            isLoading={isPending}
            isError={isError && !data}
            isEmpty={items.length === 0}
            onRetry={() => refetch()}
            errorDescription={
              isError ? getErrorMessage(error, COMPANY_REVIEW_FALLBACKS.ERROR_LOAD_PUBLIC_LIST) : undefined
            }
            emptyTitle="No reviews yet"
            emptyDescription="Published reviews from talents will appear here."
            emptyClassName="my-0"
            errorClassName="my-0"
          >
            <div className="space-y-4">
              {items.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
                >
                  <ReviewCard
                    sentiment={review.sentiment}
                    comment={review.comment}
                    ratings={{
                      recruitmentProcess: review.recruitmentProcessRating,
                      communication: review.communicationRating,
                      interviewExperience: review.interviewExperienceRating,
                      professionalism: review.professionalismRating,
                    }}
                    date={review.publishedAt}
                    dateStyle="monthYear"
                  />
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center pt-2">
                {isFetchNextPageError ? (
                  <div className="flex items-center gap-3 text-xs text-rose-600">
                    <span>Failed to load more reviews.</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fetchNextPage()}
                      className="h-8 cursor-pointer rounded-lg border-rose-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="h-9 cursor-pointer rounded-lg px-5 text-xs font-semibold"
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Show more'}
                  </Button>
                )}
              </div>
            )}
          </StateBoundary>
        </div>
      </div>
    </section>
  );
}
