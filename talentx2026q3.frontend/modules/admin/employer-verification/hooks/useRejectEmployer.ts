import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employerVerificationService } from "../services/employer-verification.service";
import { employerVerificationKeys } from "./query-keys";
import { toast } from "sonner";

export function useRejectEmployer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      employerVerificationService.rejectEmployer(id, reason),
    onSuccess: () => {
      toast.success("Employer account rejected successfully.");
      queryClient.invalidateQueries({ queryKey: employerVerificationKeys.all });
    },
    onError: () => {
      toast.error("Failed to reject employer account.");
    },
  });
}
