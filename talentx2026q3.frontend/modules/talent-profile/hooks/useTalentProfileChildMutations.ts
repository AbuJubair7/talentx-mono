import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"

import type { TalentProfileChildService } from "../types"
import { talentProfileKeys } from "./query-keys"

// Shared shape behind every talent-profile child-entity editor (work
// experience, education): create/update/delete mutations that all
// invalidate the same profile query on success and surface failures via the
// same toast, parameterized only by the entity's own service methods.
export function useTalentProfileChildMutations<TPayload>(service: TalentProfileChildService<TPayload>) {
  const queryClient = useQueryClient()

  function invalidateProfile() {
    queryClient.invalidateQueries({ queryKey: talentProfileKeys.all })
    queryClient.invalidateQueries({ queryKey: ['job-application', 'prefill'] })
  }

  function reportError(error: ApiError) {
    toast.error(error.message)
  }

  const create = useMutation({
    mutationFn: (payload: TPayload) => service.create(payload),
    onSuccess: invalidateProfile,
    onError: reportError,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TPayload }) => service.update(id, payload),
    onSuccess: invalidateProfile,
    onError: reportError,
  })

  const remove = useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: invalidateProfile,
    onError: reportError,
  })

  return { create, update, remove }
}
