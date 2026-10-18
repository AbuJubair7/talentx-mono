import { useMutation, useQueryClient } from '@tanstack/react-query';
import { COMPANY_REVIEW_QUERY_KEYS } from '../constants/company-review.constants';
import { companyReviewService } from '../services/company-review.service';

export function useWithdrawCompanyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => companyReviewService.withdraw(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_REVIEW_QUERY_KEYS.lists() });
    },
  });
}
