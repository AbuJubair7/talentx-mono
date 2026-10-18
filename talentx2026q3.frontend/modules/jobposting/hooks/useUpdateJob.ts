import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"
import { employerJobKeys } from "@/modules/employer-jobs"

import { jobsService } from "../services/jobs.service"
import type { UpdateJobPayload } from "../types/job.types"

interface UpdateJobVariables {
  id: string
  payload: UpdateJobPayload
}

export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateJobVariables) => jobsService.updateJob(id, payload),
    onSuccess: (_data, variables) => {
      toast.success(variables.payload.publish ? "Job published." : "Job saved as draft.")
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
