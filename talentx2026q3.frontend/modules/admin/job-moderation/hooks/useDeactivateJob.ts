"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/axios";
import { deactivateJob } from "../services/job-moderation.service";
import { adminJobKeys } from "./useAdminJobs";
import type { DeactivateJobPayload } from "../types/job-moderation";

export function useDeactivateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DeactivateJobPayload }) =>
      deactivateJob(id, payload),
    onSuccess: (data, { id }) => {
      // The list re-sorts and an open detail dialog shows the new status and history entry.
      queryClient.invalidateQueries({ queryKey: adminJobKeys.all });
      queryClient.invalidateQueries({ queryKey: adminJobKeys.detail(id) });
      toast.success(data.message || "Job deactivated.");
    },
    onError: (mutationError: ApiError | Error) => {
      toast.error(mutationError.message || "Failed to deactivate job.");
    },
  });
}
