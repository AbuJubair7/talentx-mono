import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"

import { resumeLibraryService } from "../services/resume.service"
import { invalidateResumeConsumers } from "./query-keys"

export function useDeleteResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resumeLibraryService.deleteResume(id),
    onSuccess: () => {
      invalidateResumeConsumers(queryClient)
      toast.success("Resume deleted.")
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { description: error.errors?.join(" ") })
    },
  })
}
