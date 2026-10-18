"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/axios";
import { reactivateJob } from "../services/job-moderation.service";
import { adminJobKeys } from "./useAdminJobs";

export function useReactivateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateJob(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminJobKeys.all });
      queryClient.invalidateQueries({ queryKey: adminJobKeys.detail(id) });
      toast.success(data.message || "Job reactivated.");
    },
    // e.g. "Cannot reactivate a job with an expired deadline..." comes through verbatim.
    onError: (mutationError: ApiError | Error) => {
      toast.error(mutationError.message || "Failed to reactivate job.");
    },
  });
}
