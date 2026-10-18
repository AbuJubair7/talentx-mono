import { useQuery } from "@tanstack/react-query";
import { employerJobsService } from "../services/employer-jobs.service";

export function useCandidateSummary(id: string | null) {
  return useQuery({
    queryKey: ["candidate-summary", id],
    queryFn: ({ signal }) => employerJobsService.getCandidateSummary(id!, signal),
    enabled: Boolean(id),
  });
}
