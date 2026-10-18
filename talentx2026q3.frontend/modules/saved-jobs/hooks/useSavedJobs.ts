'use client'

import { useQuery } from '@tanstack/react-query'

import { savedJobsService } from '../services/saved-jobs.service'

export function useSavedJobs(params: { page?: number; pageSize?: number }) {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20

  return useQuery({
    queryKey: ['saved-jobs', 'list', params],
    queryFn: () => savedJobsService.getSavedJobs(page, pageSize),
  })
}
