'use client'

import { useQuery } from '@tanstack/react-query'

import { savedJobsService } from '../services/saved-jobs.service'

export function useSavedJobIds(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['saved-jobs', 'ids'],
    queryFn: () => savedJobsService.getSavedJobIds(),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
    select: (ids) => new Set(ids),
  })
}
