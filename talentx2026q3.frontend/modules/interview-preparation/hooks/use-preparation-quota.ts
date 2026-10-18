import { useQuery } from '@tanstack/react-query';
import { PREPARATION_QUERY_KEYS } from '../constants';
import { interviewPreparationService } from '../services/interview-preparation.service';
import type { ApiError } from '@/lib/api/axios';
import type { InterviewPreparationQuota } from '../types';

// Talent-level daily AI-generation budget, shown before the user hits a 429.
export function usePreparationQuota() {
  return useQuery<InterviewPreparationQuota, ApiError>({
    queryKey: PREPARATION_QUERY_KEYS.quota(),
    queryFn: ({ signal }) => interviewPreparationService.getPreparationQuota(signal),
    staleTime: 30_000,
  });
}
