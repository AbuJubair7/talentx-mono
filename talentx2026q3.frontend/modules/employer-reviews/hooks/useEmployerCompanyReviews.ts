import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { EMPLOYER_REVIEW_QUERY_KEYS } from '../constants/employer-reviews.constants';
import { employerReviewsService } from '../services/employer-reviews.service';
import type { GetEmployerCompanyReviewsQueryParams } from '../types/employer-reviews.types';

export function useEmployerCompanyReviews(params?: GetEmployerCompanyReviewsQueryParams) {
  return useQuery({
    queryKey: EMPLOYER_REVIEW_QUERY_KEYS.list(params),
    queryFn: ({ signal }) => employerReviewsService.getReviews(params, signal),
    placeholderData: keepPreviousData,
  });
}
