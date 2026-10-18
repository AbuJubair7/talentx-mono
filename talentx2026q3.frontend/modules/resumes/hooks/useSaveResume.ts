import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"

import { resumeLibraryService } from "../services/resume.service"
import { invalidateResumeConsumers } from "./query-keys"

export interface SaveResumeInput {
  file: File
  displayName?: string
  updateProfile?: boolean
}

export function useSaveResume() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, displayName, updateProfile }: SaveResumeInput) =>
      resumeLibraryService.saveResume(file, { displayName, updateProfile }),
    onSuccess: (_resume, variables) => {
      invalidateResumeConsumers(queryClient)
      if (!variables.updateProfile) {
        toast.success("Resume saved.", {
          description: "You can reuse it when applying to jobs.",
        })
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message, { description: error.errors?.join(" ") })
    },
  })
}
