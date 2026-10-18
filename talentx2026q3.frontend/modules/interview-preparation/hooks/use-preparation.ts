import { useQuery } from '@tanstack/react-query';
import { PREPARATION_QUERY_KEYS } from '../constants';
import { interviewPreparationService } from '../services/interview-preparation.service';
import type { ApiError } from '@/lib/api/axios';
import type { InterviewPreparationDto } from '../types';

export function usePreparation(invitationId: string) {
  return useQuery<InterviewPreparationDto, ApiError>({
    queryKey: PREPARATION_QUERY_KEYS.detail(invitationId),
    queryFn: ({ signal }) => interviewPreparationService.getPreparation(invitationId, signal),
    retry: (failureCount, error) => {
      // Don't retry on 404s (no preparation exists yet)
      if (error.status === 404) return false;
      return failureCount < 3;
    },
  });
}
