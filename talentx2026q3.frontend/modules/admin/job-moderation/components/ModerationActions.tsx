"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDeactivateJob } from "../hooks/useDeactivateJob";
import { useReactivateJob } from "../hooks/useReactivateJob";
import type { AdminJobDetails, DeactivateJobPayload } from "../types/job-moderation";
import { DeactivateJobDialog } from "./DeactivateJobDialog";
import { ReactivateJobDialog } from "./ReactivateJobDialog";

type OpenDialog = "deactivate" | "reactivate" | null;

interface ModerationActionsProps {
  job: AdminJobDetails;
  // Called after a deactivate or reactivate succeeds and its confirm dialog has closed.
  onActionSuccess?: () => void;
}

// Picks the Deactivate/Reactivate buttons by job status and owns the open dialog.
export function ModerationActions({ job, onActionSuccess }: ModerationActionsProps) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const deactivateMutation = useDeactivateJob();
  const reactivateMutation = useReactivateJob();

  // Mirrors the backend rules: a published job can only go down, a deactivated one can only
  // come back, and a resubmitted one can go either way.
  const canDeactivate = job.status === "Published" || job.status === "PendingReview";
  const canReactivate = job.status === "Deactivated" || job.status === "PendingReview";
  const isResubmitted = job.status === "PendingReview";

  const handleDeactivate = async (payload: DeactivateJobPayload) => {
    try {
      await deactivateMutation.mutateAsync({ id: job.id, payload });
      setOpenDialog(null);
      onActionSuccess?.();
    } catch {
      // The dialog stays open with the admin's text; the hook already showed the error toast.
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync(job.id);
      setOpenDialog(null);
      onActionSuccess?.();
    } catch {
      // Same here: keep the dialog open so the admin can retry.
    }
  };

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {canReactivate && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpenDialog("reactivate")}
            className="cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400"
          >
            {isResubmitted ? "Approve & reactivate" : "Reactivate"}
          </Button>
        )}
        {canDeactivate && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpenDialog("deactivate")}
            className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-500/30 dark:text-rose-400"
          >
            {isResubmitted ? "Deactivate again" : "Deactivate"}
          </Button>
        )}
      </div>

      <DeactivateJobDialog
        open={openDialog === "deactivate"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        jobTitle={job.title}
        isRepeat={isResubmitted}
        isPending={deactivateMutation.isPending}
        onConfirm={handleDeactivate}
      />

      <ReactivateJobDialog
        open={openDialog === "reactivate"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        jobTitle={job.title}
        isApproval={isResubmitted}
        isExpired={job.isExpired}
        isPending={reactivateMutation.isPending}
        onConfirm={handleReactivate}
      />
    </>
  );
}
