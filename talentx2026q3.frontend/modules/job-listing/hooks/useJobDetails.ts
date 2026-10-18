import { useQuery } from "@tanstack/react-query"

import { jobListingService } from "../services/job-listing.service"

export function useJobDetails(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: ({ signal }) => jobListingService.getJobDetails(id, signal),
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number | null })?.status
      if (status === 404) return false
      return failureCount < 1
    },
  })
}
