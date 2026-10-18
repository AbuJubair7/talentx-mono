import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"
import { employerJobKeys } from "@/modules/employer-jobs"

import { jobsService } from "../services/jobs.service"
import type { CreateJobPayload } from "../types/job.types"

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateJobPayload) => jobsService.createJob(payload),
    onSuccess: (_jobId, payload) => {
      toast.success(payload.publish ? "Job published." : "Job saved as draft.")
      queryClient.invalidateQueries({ queryKey: employerJobKeys.all })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      queryClient.invalidateQueries({ queryKey: ["home", "recent-jobs"] })
    },
    onError: (error: ApiError) => {
      toast.error(error.message, {
        description: error.errors?.join(" "),
      })
    },
  })
}
