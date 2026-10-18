import { useQuery } from "@tanstack/react-query";

import { jobApplicationService } from "../services/job-application.service";


export function useApplicationPrefill() {
  return useQuery({
    queryKey: ["job-application", "prefill"],
    queryFn: ({ signal }) => jobApplicationService.getPrefill(signal),
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number | null })?.status
      if (status === 404 || status === 401 || status === 403) return false
      return failureCount < 1
    },
  })
}
