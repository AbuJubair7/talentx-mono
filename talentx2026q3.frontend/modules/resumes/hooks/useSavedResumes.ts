import { useQuery } from "@tanstack/react-query"

import { resumeLibraryService } from "../services/resume.service"
import { resumeLibraryKeys } from "./query-keys"

export function useSavedResumes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: resumeLibraryKeys.list(),
    queryFn: () => resumeLibraryService.listResumes(),
    enabled: options?.enabled ?? true,
  })
}
