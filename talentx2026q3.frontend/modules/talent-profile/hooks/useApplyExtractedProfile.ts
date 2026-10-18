import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"

import { talentProfileService } from "../services/talent-profile.service"
import type { ApplyExtractedProfileInput } from "../types"
import { talentProfileKeys } from "./query-keys"

export function useApplyExtractedProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload, resumeFile }: ApplyExtractedProfileInput) =>
      talentProfileService.applyExtractedProfile(payload, resumeFile),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: talentProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['job-application', 'prefill'] })
      if (variables?.resumeFile) {
        toast.success("Resume replaced.", {
          description: "Your skills, work experience, and education were updated.",
        })
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message, {
        description: error.errors?.join(" "),
      })
    },
  })
}
