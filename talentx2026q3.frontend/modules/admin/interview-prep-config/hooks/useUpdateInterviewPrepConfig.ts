"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/axios";
import { updateInterviewPrepConfig } from "../services/config.service";
import { interviewPrepConfigKeys } from "./useInterviewPrepConfig";

export function useUpdateInterviewPrepConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInterviewPrepConfig,
    onSuccess: () => {
      toast.success("Interview preparation settings updated successfully");
      queryClient.invalidateQueries({ queryKey: interviewPrepConfigKeys.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update interview preparation settings");
    },
  });
}
