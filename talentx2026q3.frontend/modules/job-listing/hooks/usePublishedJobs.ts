import { useQuery } from '@tanstack/react-query'
import type { JobFilterParams } from '@/types/job'
import { jobListingService } from '../services/job-listing.service'

export function usePublishedJobs(filters: JobFilterParams = {}) {
  return useQuery({
    queryKey: ['jobs', 'published', filters],
    queryFn: ({ signal }) => jobListingService.getPublishedJobs(filters, signal),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}
