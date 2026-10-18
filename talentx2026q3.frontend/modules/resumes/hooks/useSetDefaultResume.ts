import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"

import { resumeLibraryService } from "../services/resume.service"
import { invalidateResumeConsumers } from "./query-keys"

export function useSetDefaultResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resumeLibraryService.setDefaultResume(id),
    onSuccess: () => {
      invalidateResumeConsumers(queryClient)
      toast.success("Default resume updated.")
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { description: error.errors?.join(" ") })
    },
  })
}
