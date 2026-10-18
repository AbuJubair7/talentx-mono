import { useQuery } from "@tanstack/react-query"

import { employerJobsService } from "../services/employer-jobs.service"
import { employerJobKeys } from "./query-keys"

export function useMyJobs() {
  return useQuery({
    queryKey: employerJobKeys.jobs(),
    queryFn: () => employerJobsService.getMyJobs(),
  })
}
