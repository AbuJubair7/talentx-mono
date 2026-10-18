import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PREPARATION_QUERY_KEYS } from '../constants';
import { interviewPreparationService } from '../services/interview-preparation.service';
import type { ApiError } from '@/lib/api/axios';
import type { InterviewPreparationDto } from '../types';

export function useEvaluateAnswers() {
  const queryClient = useQueryClient();

  return useMutation<InterviewPreparationDto, ApiError, string>({
    mutationFn: (invitationId: string) =>
      interviewPreparationService.evaluateAnswers(invitationId),
    onSuccess: (data, invitationId) => {
      queryClient.setQueryData(PREPARATION_QUERY_KEYS.detail(invitationId), data);
      toast.success('Your AI evaluation report is ready.');
    },
    onError: (error) => {
      toast.error(error.message || 'Could not evaluate your answers. Please try again.');
    },
  });
}
