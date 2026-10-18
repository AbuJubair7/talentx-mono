import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TALENT_INTERVIEW_QUERY_KEYS } from '../constants/interview.constants';
import { talentInterviewService } from '../services/interview.service';
import type { DeclineInterviewPayload } from '../types/interview.types';

interface DeclineInterviewVariables {
  invitationId: string;
  payload: DeclineInterviewPayload;
}

export function useDeclineInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, payload }: DeclineInterviewVariables) =>
      talentInterviewService.decline(invitationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TALENT_INTERVIEW_QUERY_KEYS.lists() });
    },
  });
}
