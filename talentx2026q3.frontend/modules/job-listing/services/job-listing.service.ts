import { apiClient } from "@/lib/api/axios"
import type { JobListItem, JobDetails, PagedResult, ApplicationStatusResult } from '../types/job.types';

import type { JobFilterParams } from '@/types/job'


export const jobListingService = {
  getPublishedJobs: async (
    filters: JobFilterParams = {},
    signal?: AbortSignal,
  ): Promise<PagedResult<JobListItem>> => {
    const params: Record<string, string | number> = {}
    if (filters.keyword?.trim()) params.keyword = filters.keyword.trim()
    if (filters.location?.trim()) params.location = filters.location.trim()
    if (filters.employmentType) params.employmentType = filters.employmentType
    if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel
    if (filters.workArrangement) params.workArrangement = filters.workArrangement
    params.page = filters.page ?? 1
    params.pageSize = filters.pageSize ?? 12

    const { data } = await apiClient.get<PagedResult<JobListItem>>('/jobs', {
      params,
      signal,
    })
    return data
  },

  getJobDetails: async (id: string, signal?: AbortSignal): Promise<JobDetails> => {
    const { data } = await apiClient.get<JobDetails>(`/jobs/${id}`, { signal })
    return data
  },

  // Authenticated Talent only — the backend resolves the Talent from the JWT.
  getApplicationStatus: async (jobId: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<ApplicationStatusResult>(
      `/jobs/${jobId}/applications/me`,
      { signal },
    );
    return data;
  },
};

