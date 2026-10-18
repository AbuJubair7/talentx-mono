import { useQuery } from "@tanstack/react-query"

import { jobListingService } from "../services/job-listing.service"

/**
 * Checks whether the current Talent has already applied to a job.
 * Pass `enabled: false` for anonymous visitors / non-Talent roles so no
 * backend request is made.
 */
export function useApplicationStatus(jobId: string, { enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: ["jobs", jobId, "application-status"],
    queryFn: ({ signal }) => {
      console.log("[apply-check] calling has-applied API → /jobs/%s/applications/me", jobId)
      return jobListingService.getApplicationStatus(jobId, signal)
    },
    enabled,
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number | null })?.status
      if (status === 404 || status === 401 || status === 403) return false
      return failureCount < 1
    },
  })
}
