import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"

import { talentProfileService } from "../services/talent-profile.service"
import type { UpdateTalentProfilePayload } from "../types/talent-profile.types"
import { talentProfileKeys } from "./query-keys"

export function useUpdateTalentProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTalentProfilePayload) => talentProfileService.updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: talentProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: ['job-application', 'prefill'] })
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success("Profile updated.")
    },
    onError: (error: ApiError) => {
      toast.error(error.message, {
        description: error.errors?.join(" "),
      })
    },
  })
}
