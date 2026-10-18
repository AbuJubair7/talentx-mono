import { useMutation, useQueryClient } from '@tanstack/react-query';
import { COMPANY_REVIEW_QUERY_KEYS } from '../constants/company-review.constants';
import { companyReviewService } from '../services/company-review.service';
import type { UpdateCompanyReviewPayload } from '../types/company-review.types';

interface UpdateCompanyReviewVariables {
  reviewId: string;
  payload: UpdateCompanyReviewPayload;
}

export function useUpdateCompanyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: UpdateCompanyReviewVariables) =>
      companyReviewService.update(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPANY_REVIEW_QUERY_KEYS.lists() });
    },
  });
}
