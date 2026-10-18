import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { COMPANY_REVIEW_QUERY_KEYS } from '../constants/company-review.constants';
import { companyReviewService } from '../services/company-review.service';
import type { GetMyCompanyReviewsQueryParams } from '../types/company-review.types';

export function useMyCompanyReviews(params?: GetMyCompanyReviewsQueryParams) {
  return useQuery({
    queryKey: COMPANY_REVIEW_QUERY_KEYS.list(params),
    queryFn: ({ signal }) => companyReviewService.getMyReviews(params, signal),
    placeholderData: keepPreviousData,
  });
}
