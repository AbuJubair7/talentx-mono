import { useQuery } from "@tanstack/react-query"

import { jobsService } from "../services/jobs.service"

export function useJob(id: string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobsService.getJob(id),
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number | null })?.status
      if (status === 404) return false
      return failureCount < 1
    },
  })
}
