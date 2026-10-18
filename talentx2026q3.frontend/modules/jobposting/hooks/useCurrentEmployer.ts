import { useQuery } from "@tanstack/react-query"

import { meService } from "../services/me.service"

export function useCurrentEmployer(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["me"],
    queryFn: meService.getCurrentEmployer,
    enabled: options?.enabled ?? true,
  })
}
