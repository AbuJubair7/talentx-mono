import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { TALENT_INTERVIEW_QUERY_KEYS } from '../constants/interview.constants';
import { talentInterviewService } from '../services/interview.service';
import type { GetMyInterviewsQueryParams } from '../types/interview.types';

export function useMyInterviews(params?: GetMyInterviewsQueryParams) {
  return useQuery({
    queryKey: TALENT_INTERVIEW_QUERY_KEYS.list(params),
    queryFn: ({ signal }) => talentInterviewService.getMyInterviews(params, signal),
    placeholderData: keepPreviousData,
  });
}
