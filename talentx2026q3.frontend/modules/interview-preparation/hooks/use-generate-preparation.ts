import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PREPARATION_QUERY_KEYS } from '../constants';
import { interviewPreparationService } from '../services/interview-preparation.service';
import type { ApiError } from '@/lib/api/axios';
import type { InterviewPreparationDto } from '../types';

export function useGeneratePreparation() {
  const queryClient = useQueryClient();

  return useMutation<InterviewPreparationDto, ApiError, string>({
    mutationFn: (invitationId: string) =>
      interviewPreparationService.generatePreparation(invitationId),
    onSuccess: (data, invitationId) => {
      queryClient.setQueryData(PREPARATION_QUERY_KEYS.detail(invitationId), data);
      queryClient.invalidateQueries({ queryKey: PREPARATION_QUERY_KEYS.quota() });
      toast.success('Interview preparation generated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate preparation.');
    },
  });
}
