import { useQuery } from "@tanstack/react-query"

import { resumeLibraryService } from "../services/resume.service"
import { resumeLibraryKeys } from "./query-keys"

// Presigned URLs expire after 15 minutes, so this query is fetched only when a
// preview is opened and is never cached as fresh.
export function useResumeUrl(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: resumeLibraryKeys.url(id ?? "none"),
    queryFn: () => resumeLibraryService.getResumeUrl(id as string),
    enabled: enabled && Boolean(id),
    staleTime: 0,
    gcTime: 0,
  })
}
