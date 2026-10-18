import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { employerJobsService } from "../services/employer-jobs.service";
import type { CandidateMatch, JobInvitation } from "../types/employer-job.types";

export function useSendInvitation(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (talentUserId: string) => employerJobsService.sendInvitation(jobId, talentUserId),
    onSuccess: (data: JobInvitation, talentUserId) => {
      toast.success("Invitation sent successfully!");
      queryClient.setQueryData<CandidateMatch[]>(
        ["employer-job-candidates", jobId],
        (old): CandidateMatch[] | undefined => {
          if (!old) return undefined;
          return old.map((c) =>
            c.talentUserId === talentUserId
              ? { ...c, status: 'Pending' as const, hasActiveInvitation: true, invitationStatus: 'Pending', invitationId: data.id }
              : c
          );
        }
      );
      queryClient.invalidateQueries({ queryKey: ["employer-job-invitations", jobId] });
    },
    onError: (err: unknown) => {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const message = errorObj?.response?.data?.message ?? errorObj?.message ?? "Failed to send invitation.";
      toast.error(message);
    },
  });
}
