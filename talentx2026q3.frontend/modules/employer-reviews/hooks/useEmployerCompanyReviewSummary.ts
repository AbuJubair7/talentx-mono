import { useQuery } from '@tanstack/react-query';
import { EMPLOYER_REVIEW_QUERY_KEYS } from '../constants/employer-reviews.constants';
import { employerReviewsService } from '../services/employer-reviews.service';

export function useEmployerCompanyReviewSummary() {
  return useQuery({
    queryKey: EMPLOYER_REVIEW_QUERY_KEYS.summaries(),
    queryFn: ({ signal }) => employerReviewsService.getSummary(signal),
  });
}
