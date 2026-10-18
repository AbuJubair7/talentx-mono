import type { JobDto } from '@/types/job'
import type { JobListItem } from '@/modules/job-listing/types/job.types'
import { apiClient } from '@/lib/api/axios'

export async function getRecentJobs(): Promise<JobListItem[]> {
  
  const { data } = await apiClient.get('/jobs', {
    params: { page: 1, pageSize: 6 },
  })
  return data.items
}

export async function getJobById(id: string): Promise<JobDto | null> {
  
  const { data } = await apiClient.get<JobDto>(`/jobs/${id}`)
  return data
}