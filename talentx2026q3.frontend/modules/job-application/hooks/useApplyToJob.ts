import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiError } from "@/lib/api/axios";

import { jobApplicationService } from "../services/job-application.service";
import type { ApplyPayload } from "../types/job-application.types";

import { applyToJob } from "../services/job-application.service";
import type { ApplyToJobPayload, ApplyToJobResponse } from "../types/application.types";

export function useTalentApplyToJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplyPayload) =>
      jobApplicationService.submitApplication(jobId, payload),
    onSuccess: () => {
      toast.success("Application submitted.")
      queryClient.invalidateQueries({
        queryKey: ["jobs", jobId, "application-status"],
      })
      // The dashboard caches its lists for 60s — bust them so the
      // "Track your applications" link lands on a fresh list.
      queryClient.invalidateQueries({
        queryKey: ["talent-applications"],
      })
      queryClient.invalidateQueries({
        queryKey: ["talent-application-counts"],
      })
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { description: error.errors?.join(" ") })
    },
  })
}


export function useApplyToJob() {
  const queryClient = useQueryClient();

  return useMutation<
    ApplyToJobResponse,
    ApiError,
    { jobId: string; payload: ApplyToJobPayload }
  >({
    mutationFn: ({ jobId, payload }) => applyToJob(jobId, payload),
    onSuccess: (_data, { jobId }) => {
      queryClient.invalidateQueries({
        queryKey: ["jobs", jobId, "application-status"],
      });
      queryClient.invalidateQueries({
        queryKey: ["job-applicants", "list", jobId],
      });
    },
    onError: (error) => {
      if (error.status === 400) {
        toast.error("Please review the form", {
          description: error.errors?.join(" ") ?? error.message,
        })
      } else if (error.status === 404) {
        toast.error("This job is no longer available", {
          description: error.message || "It may have been removed or filled.",
        })
      } else {
        toast.error("Submission failed", {
          description: error.message || "Something went wrong. Please try again.",
        })
      }
    },
  })
}
