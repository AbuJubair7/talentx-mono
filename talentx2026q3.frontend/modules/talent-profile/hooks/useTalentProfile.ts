import { useQuery } from "@tanstack/react-query"

import { talentProfileService } from "../services/talent-profile.service"
import { talentProfileKeys } from "./query-keys"

export function useTalentProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: talentProfileKeys.detail(),
    queryFn: () => talentProfileService.getMyProfile(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number | null })?.status
      if (status === 404) return false
      return failureCount < 1
    },
  })
}
