import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PREPARATION_QUERY_KEYS } from '../constants';
import { interviewPreparationService } from '../services/interview-preparation.service';
import type { ApiError } from '@/lib/api/axios';
import type { InterviewPreparationDto, SaveAnswerPayload } from '../types';

export interface SaveAnswerVariables {
  invitationId: string;
  payload: SaveAnswerPayload;
}

export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation<InterviewPreparationDto, ApiError, SaveAnswerVariables>({
    mutationFn: ({ invitationId, payload }) =>
      interviewPreparationService.saveAnswer(invitationId, payload),
    onSuccess: (data, { invitationId }) => {
      const previous = queryClient.getQueryData<InterviewPreparationDto>(
        PREPARATION_QUERY_KEYS.detail(invitationId),
      );
      queryClient.setQueryData(PREPARATION_QUERY_KEYS.detail(invitationId), data);
      // The server clears the report whenever an answer's text changes; say so
      // instead of letting the report silently vanish.
      if (previous?.evaluation && !data.evaluation) {
        toast.info(
          'Your answer changed, so the AI report was cleared. Evaluate again for a fresh report.',
        );
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Could not save your answer. Please try again.');
    },
  });
}
