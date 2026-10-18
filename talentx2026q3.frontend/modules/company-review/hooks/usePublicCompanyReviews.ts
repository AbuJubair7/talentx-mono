'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import {
  COMPANY_REVIEW_PAGE_NUMBER,
  COMPANY_REVIEW_PAGE_SIZE,
  COMPANY_REVIEW_QUERY_KEYS,
} from '../constants/company-review.constants';
import { companyReviewService } from '../services/company-review.service';
import type { PaginatedCompanyReviewList, PublicCompanyReviewDto } from '../types/company-review.types';

export function usePublicCompanyReviews(companyId: string, pageSize = COMPANY_REVIEW_PAGE_SIZE) {
  return useInfiniteQuery<PaginatedCompanyReviewList<PublicCompanyReviewDto>>({
    queryKey: COMPANY_REVIEW_QUERY_KEYS.publicList(companyId, { pageSize }),
    queryFn: ({ pageParam, signal }) =>
      companyReviewService.getPublicReviews(companyId, { page: pageParam as number, pageSize }, signal),
    initialPageParam: COMPANY_REVIEW_PAGE_NUMBER,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    enabled: Boolean(companyId),
  });
}
