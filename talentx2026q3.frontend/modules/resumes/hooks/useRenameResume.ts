import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"

import { resumeLibraryService } from "../services/resume.service"
import { invalidateResumeConsumers } from "./query-keys"

export function useRenameResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, displayName }: { id: string; displayName: string }) =>
      resumeLibraryService.renameResume(id, displayName),
    onSuccess: () => {
      invalidateResumeConsumers(queryClient)
      toast.success("Resume renamed.")
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { description: error.errors?.join(" ") })
    },
  })
}
