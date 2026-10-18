import { apiClient } from '@/lib/api/axios';
import { INTERVIEW_ENDPOINTS } from '../constants/interview.constants';
import type {
  EmployerInterviewDto,
  GetJobInterviewsQueryParams,
  PaginatedInterviewList,
  SendInterviewBatchPayload,
  SendInterviewBatchResponse,
} from '../types/interview.types';

export const interviewService = {
  sendBatch: async (
    jobId: string,
    payload: SendInterviewBatchPayload
  ): Promise<SendInterviewBatchResponse> => {
    const { data } = await apiClient.post<SendInterviewBatchResponse>(
      INTERVIEW_ENDPOINTS.sendBatch(jobId),
      payload
    );
    return data;
  },

  getJobInterviews: async (
    jobId: string,
    params?: GetJobInterviewsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedInterviewList<EmployerInterviewDto>> => {
    const { data } = await apiClient.get<PaginatedInterviewList<EmployerInterviewDto>>(
      INTERVIEW_ENDPOINTS.jobInterviews(jobId),
      { params, signal }
    );
    return data;
  },
};
