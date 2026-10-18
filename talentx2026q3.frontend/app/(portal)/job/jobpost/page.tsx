"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCurrentEmployer } from "@/modules/jobposting/hooks/useCurrentEmployer";
import { meService } from "@/modules/jobposting/services/me.service";
import { VerificationStatusBanner } from "@/modules/employer-verification";
import { CreateJobView } from "@/modules/jobposting";

export default function CreateJobPage() {
  const { data: employer, isLoading } = useCurrentEmployer();
  const queryClient = useQueryClient();

  const reApplyMutation = useMutation({
    mutationFn: meService.reApply,
    onSuccess: () => {
      toast.success("Re-application submitted. Your account is now pending verification.");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      toast.error("Failed to re-apply. Please try again.");
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full p-6 sm:p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      </div>
    );
  }

  if (!employer || employer.verificationStatus !== "Verified") {
    return (
      <div className="mx-auto w-full p-6 sm:p-8">
        <VerificationStatusBanner
          status={employer?.verificationStatus ?? "PendingVerification"}
          rejectionReason={employer?.rejectionReason}
          onReApply={employer?.verificationStatus === "Rejected" ? () => reApplyMutation.mutate() : undefined}
          isReApplying={reApplyMutation.isPending}
        />
      </div>
    );
  }

  return <CreateJobView />;
}
