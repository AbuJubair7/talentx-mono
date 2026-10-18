import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { INTERVIEW_QUERY_KEYS } from '../constants/interview.constants';
import { interviewService } from '../services/interview.service';
import type { GetJobInterviewsQueryParams } from '../types/interview.types';

export function useJobInterviews(jobId: string, params?: GetJobInterviewsQueryParams) {
  return useQuery({
    queryKey: INTERVIEW_QUERY_KEYS.list(jobId, params),
    queryFn: ({ signal }) => interviewService.getJobInterviews(jobId, params, signal),
    enabled: !!jobId,
    placeholderData: keepPreviousData,
  });
}
