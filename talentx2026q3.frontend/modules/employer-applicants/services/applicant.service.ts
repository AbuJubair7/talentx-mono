import { apiClient } from '@/lib/api/axios';
import {
  APPLICANT_ENDPOINTS,
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '../constants';
import type {
  CandidateProfile,
  JobApplicant,
  ApplicationStatus,
  GetJobApplicantsQueryParams,
  PaginatedApplicantList,
  ScoreApplicantsResponse,
  StatusUpdateResponse,
} from '../types/applicant.types';

export const applicantService = {
  getJobApplicants: async (
    jobId: string,
    params?: GetJobApplicantsQueryParams,
    signal?: AbortSignal
  ): Promise<PaginatedApplicantList<JobApplicant>> => {
    const { data } = await apiClient.get<PaginatedApplicantList<JobApplicant> | JobApplicant[]>(
      APPLICANT_ENDPOINTS.jobApplications(jobId),
      { params, signal }
    );

    if (Array.isArray(data)) {
      return {
        items: data,
        page: params?.page ?? DEFAULT_PAGE_NUMBER,
        pageSize: params?.pageSize ?? (data.length || DEFAULT_PAGE_SIZE),
        totalCount: data.length,
        totalPages: 1,
      };
    }

    return data;
  },

  updateApplicationStatus: async (
    applicationId: string,
    newStatus: ApplicationStatus
  ): Promise<StatusUpdateResponse> => {
    const { data } = await apiClient.patch<StatusUpdateResponse>(
      APPLICANT_ENDPOINTS.updateStatus(applicationId),
      { newStatus }
    );
    return data ?? {};
  },

  getCandidateProfile: async (
    applicationId: string,
    signal?: AbortSignal
  ): Promise<CandidateProfile> => {
    const { data } = await apiClient.get<CandidateProfile>(
      APPLICANT_ENDPOINTS.candidateProfile(applicationId),
      { signal }
    );
    return data;
  },

  scoreApplicants: async (jobId: string): Promise<ScoreApplicantsResponse> => {
    const { data } = await apiClient.post<ScoreApplicantsResponse>(
      APPLICANT_ENDPOINTS.scoreApplicants(jobId)
    );
    return data;
  },
};

