import { apiClient } from '@/lib/api/axios'
import type { PagedResult } from '@/modules/job-listing/types/job.types'

import type { SavedJobResponse } from '../types/saved-job.types'

export const savedJobsService = {
  saveJob: async (jobId: string): Promise<string> => {
    const { data } = await apiClient.post<string>(`/saved-jobs/${jobId}`)
    return data
  },

  removeSavedJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/saved-jobs/${jobId}`)
  },

  getSavedJobIds: async (): Promise<string[]> => {
    const { data } = await apiClient.get<string[]>('/saved-jobs/job-ids')
    return data
  },

  getSavedJobs: async (page: number, pageSize: number): Promise<PagedResult<SavedJobResponse>> => {
    const { data } = await apiClient.get<PagedResult<SavedJobResponse>>('/saved-jobs', {
      params: { page, pageSize },
    })
    return data
  },
}
