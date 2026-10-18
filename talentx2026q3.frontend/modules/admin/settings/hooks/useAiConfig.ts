"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/axios";
import { getAiConfiguration, updateAiConfiguration } from "../services/ai-config.service";
import type { UpdateAiConfigRequest } from "../types/ai-config";

export const aiConfigKeys = {
  all: ["admin", "ai-configuration"] as const,
};

export function useAiConfiguration() {
  return useQuery({
    queryKey: aiConfigKeys.all,
    queryFn: getAiConfiguration,
  });
}

export function useUpdateAiConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAiConfigRequest) => updateAiConfiguration(data),
    onSuccess: () => {
      toast.success("AI configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: aiConfigKeys.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update AI configuration");
    },
  });
}
