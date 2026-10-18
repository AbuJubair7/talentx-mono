import { apiClient } from '@/lib/api/axios';
import { TALENT_INTERVIEW_ENDPOINTS } from '../constants/interview.constants';
import type {
  AcceptInterviewPayload,
  DeclineInterviewPayload,
  GetMyInterviewsQueryParams,
  InterviewActionResponse,
  PaginatedInterviewList,
  TalentInterviewDto,
} from '../types/interview.types';

export const talentInterviewService = {
  getMyInterviews: async (
    params?: GetMyInterviewsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedInterviewList<TalentInterviewDto>> => {
    const { data } = await apiClient.get<PaginatedInterviewList<TalentInterviewDto>>(
      TALENT_INTERVIEW_ENDPOINTS.myInterviews(),
      { params, signal }
    );
    return data;
  },

  accept: async (
    invitationId: string,
    payload: AcceptInterviewPayload
  ): Promise<InterviewActionResponse> => {
    const { data } = await apiClient.post<InterviewActionResponse>(
      TALENT_INTERVIEW_ENDPOINTS.accept(invitationId),
      payload
    );
    return data ?? {};
  },

  decline: async (
    invitationId: string,
    payload: DeclineInterviewPayload
  ): Promise<InterviewActionResponse> => {
    const { data } = await apiClient.post<InterviewActionResponse>(
      TALENT_INTERVIEW_ENDPOINTS.decline(invitationId),
      payload
    );
    return data ?? {};
  },
};
