import { useMutation, useQueryClient } from '@tanstack/react-query';
import { COMPANY_REVIEW_QUERY_KEYS } from '../constants/company-review.constants';
import { companyReviewService } from '../services/company-review.service';
import type { SubmitCompanyReviewPayload } from '../types/company-review.types';

export function useSubmitCompanyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitCompanyReviewPayload) => companyReviewService.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_REVIEW_QUERY_KEYS.lists() });
    },
  });
}
