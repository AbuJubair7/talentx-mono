import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employerVerificationService } from "../services/employer-verification.service";
import { employerVerificationKeys } from "./query-keys";
import { toast } from "sonner";

export function useApproveEmployer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employerVerificationService.approveEmployer(id),
    onSuccess: () => {
      toast.success("Employer account approved successfully.");
      queryClient.invalidateQueries({ queryKey: employerVerificationKeys.all });
    },
    onError: () => {
      toast.error("Failed to approve employer account.");
    },
  });
}
