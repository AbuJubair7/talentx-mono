import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employerJobsService } from "../services/employer-jobs.service";
import type { CandidateMatch } from "../types/employer-job.types";

export function useWithdrawInvitation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => employerJobsService.withdrawInvitation(jobId, invitationId),
    onSuccess: (_data, invitationId) => {
      toast.success("Invitation withdrawn.");
      queryClient.setQueryData<CandidateMatch[]>(
        ["employer-job-candidates", jobId],
        (old): CandidateMatch[] | undefined => {
          if (!old) return undefined;
          return old.map((c) =>
            c.invitationId === invitationId
              ? { ...c, invitationStatus: 'Withdrawn', hasActiveInvitation: false }
              : c
          );
        }
      );
      queryClient.invalidateQueries({ queryKey: ["employer-job-invitations", jobId] });
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message ?? errorObj?.message ?? "Failed to withdraw invitation.";
      toast.error(message);
    },
  });
}
