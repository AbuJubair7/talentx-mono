import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employerJobsService } from "../services/employer-jobs.service";

export function useRunMatching(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => employerJobsService.runMatching(jobId),
    onSuccess: (data) => {
      queryClient.setQueryData(["employer-job-candidates", jobId], data.candidates);
      queryClient.invalidateQueries({ queryKey: ["employer-job-candidates", jobId] });
      const reused = data.reusedCount ?? 0;
      const reusedNote =
        reused > 0 ? ` Reused ${reused} existing match${reused !== 1 ? 'es' : ''}.` : "";
      toast.success(`AI matching completed! Evaluated ${data.matchedCount} candidate(s).${reusedNote}`);
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message ?? errorObj?.message ?? "Failed to run AI matching.";
      toast.error(message);
    },
  });
}
