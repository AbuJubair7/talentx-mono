import { useQuery } from "@tanstack/react-query";
import { employerJobsService } from "../services/employer-jobs.service";

export function useMatchedCandidates(jobId: string, enabled = true) {
  return useQuery({
    queryKey: ["employer-job-candidates", jobId],
    queryFn: ({ signal }) => employerJobsService.getMatchedCandidates(jobId, signal),
    enabled: Boolean(jobId) && enabled,
  });
}
