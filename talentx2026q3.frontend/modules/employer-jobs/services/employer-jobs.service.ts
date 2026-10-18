import { apiClient } from '@/lib/api/axios';
import type {
  CandidateMatch,
  CandidateProfileSummary,
  EmployerDashboardDto,
  EmployerJob,
  EmployerJobListItemDto,
  EmployerJobsQueryParams,
  JobInvitation,
  JobPipelineSummaryDto,
  PaginatedList,
  RunMatchingResponse,
  UpdateJobPayload,
} from '../types/employer-job.types';

const MOCK_JOB: EmployerJob = {
  id: 'mock-1',
  title: 'Frontend Developer',
  companyName: 'Acme Inc',
  description: 'Build and ship user-facing features.',
  location: 'Dhaka, Bangladesh',
  employmentType: 'FullTime',
  experienceLevel: 'MidLevel',
  workArrangement: 'Hybrid',
  requiredSkills: ['React', 'TypeScript'],
  vacancies: 2,
  status: 'Published',
  createdAt: '2026-08-15T06:01:30.000Z',
  expireAt: '2026-09-15T06:01:30.000Z',
};

export const employerJobsService = {
  getDashboard: async (abortSignal?: AbortSignal): Promise<EmployerDashboardDto> => {
    const dashboardResponse = await apiClient.get<EmployerDashboardDto>('/employers/dashboard', {
      signal: abortSignal,
    });
    return dashboardResponse.data;
  },

  getJobs: async (
    queryParams?: EmployerJobsQueryParams,
    abortSignal?: AbortSignal
  ): Promise<PaginatedList<EmployerJobListItemDto>> => {
    const jobsResponse = await apiClient.get<PaginatedList<EmployerJobListItemDto>>('/employers/jobs', {
      params: queryParams,
      signal: abortSignal,
    });
    return jobsResponse.data;
  },

  getMyJobs: async (abortSignal?: AbortSignal): Promise<EmployerJob[]> => {
    const jobsResponse = await apiClient.get<PaginatedList<EmployerJobListItemDto>>('/employers/jobs', {
      signal: abortSignal,
    });
    return jobsResponse.data.items as unknown as EmployerJob[];
  },

  getMyJobById: async (jobId: string, abortSignal?: AbortSignal): Promise<EmployerJob> => {
    try {
      const jobResponse = await apiClient.get<EmployerJob>(`/jobs/mine/${jobId}`, {
        signal: abortSignal,
      });
      return jobResponse.data;
    } catch {
      const fallbackResponse = await apiClient.get<EmployerJob>(`/jobs/${jobId}`, {
        signal: abortSignal,
      });
      return fallbackResponse.data;
    }
  },

  getJobPipelineSummary: async (
    jobId: string,
    abortSignal?: AbortSignal
  ): Promise<JobPipelineSummaryDto> => {
    const response = await apiClient.get<JobPipelineSummaryDto>(
      `/jobs/${jobId}/pipeline-summary`,
      { signal: abortSignal }
    );
    return response.data;
  },

  closeJob: async (jobId: string): Promise<void> => {
    await apiClient.patch(`/jobs/${jobId}/status`);
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/jobs/${jobId}`);
  },

  reopenJob: async (jobId: string): Promise<void> => {
    await apiClient.patch(`/jobs/${jobId}/reopen`);
  },

  // Sends a deactivated job back to an admin for re-verification.
  resubmitJob: async (jobId: string): Promise<void> => {
    await apiClient.patch(`/jobs/${jobId}/resubmit`);
  },

  publishJob: async (jobId: string): Promise<void> => {
    await apiClient.patch(`/jobs/${jobId}/publish`);
  },

  updateJob: async (jobId: string, payload: UpdateJobPayload): Promise<void> => {
    await apiClient.patch(`/jobs/${jobId}`, payload);
  },

  runMatching: async (jobId: string): Promise<RunMatchingResponse> => {
    const response = await apiClient.post<RunMatchingResponse>(`/employers/jobs/${jobId}/match`);
    return response.data;
  },

  getMatchedCandidates: async (jobId: string, signal?: AbortSignal): Promise<CandidateMatch[]> => {
    const response = await apiClient.get<CandidateMatch[]>(`/employers/jobs/${jobId}/candidates`, { signal });
    return response.data;
  },

  sendInvitation: async (jobId: string, talentUserId: string): Promise<JobInvitation> => {
    const response = await apiClient.post<JobInvitation>(`/employers/jobs/${jobId}/invite`, { talentUserId });
    return response.data;
  },

  withdrawInvitation: async (jobId: string, invitationId: string): Promise<JobInvitation> => {
    const response = await apiClient.patch<JobInvitation>(
      `/employers/jobs/${jobId}/invitations/${invitationId}/withdraw`
    );
    return response.data;
  },

  respondToInvitation: async (jobId: string, invitationId: string, response: 'accepted' | 'declined'): Promise<JobInvitation> => {
    const resp = await apiClient.patch<JobInvitation>(
      `/employers/jobs/${jobId}/invitations/${invitationId}/respond`,
      { response }
    );
    return resp.data;
  },

  getJobInvitations: async (jobId: string, signal?: AbortSignal): Promise<JobInvitation[]> => {
    const response = await apiClient.get<JobInvitation[]>(`/employers/jobs/${jobId}/invitations`, { signal });
    return response.data;
  },

  getCandidateSummary: async (id: string, signal?: AbortSignal): Promise<CandidateProfileSummary> => {
    const response = await apiClient.get<CandidateProfileSummary>(`/employers/candidates/${id}/summary`, { signal });
    return response.data;
  },
};