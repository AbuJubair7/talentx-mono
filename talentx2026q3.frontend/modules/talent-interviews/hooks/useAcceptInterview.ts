import { useMutation, useQueryClient } from '@tanstack/react-query';
import { COMPANY_REVIEW_QUERY_KEYS } from '@/modules/company-review';
import { TALENT_INTERVIEW_QUERY_KEYS } from '../constants/interview.constants';
import { talentInterviewService } from '../services/interview.service';
import type { AcceptInterviewPayload } from '../types/interview.types';

interface AcceptInterviewVariables {
  invitationId: string;
  payload: AcceptInterviewPayload;
}

export function useAcceptInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, payload }: AcceptInterviewVariables) =>
      talentInterviewService.accept(invitationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TALENT_INTERVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPANY_REVIEW_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['talent-applications'] });
      queryClient.invalidateQueries({ queryKey: ['talent-application-counts'] });
    },
  });
}
