'use client'

import { useQuery } from '@tanstack/react-query'
import { getRecentJobs } from '../services/home.service'

// Feature hook. Components use this and get { data, isLoading, isError, refetch }
// — which drive the StateBoundary. The hook doesn't know or care whether the
// data came from the mock or the real API; that's the service's job.
export function useRecentJobs() {
  return useQuery({
    queryKey: ['home', 'recent-jobs'],
    queryFn: getRecentJobs,
  })
}