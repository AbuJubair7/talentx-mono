import type { QueryClient } from "@tanstack/react-query"

export const resumeLibraryKeys = {
  all: ["resume-library"] as const,
  list: () => [...resumeLibraryKeys.all, "list"] as const,
  url: (id: string) => [...resumeLibraryKeys.all, "url", id] as const,
}

// Saved resumes are shown on the profile and in the application prefill, and
// saving one can also update the profile via AI extraction — so every mutation
// busts all three consumers.
export function invalidateResumeConsumers(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: resumeLibraryKeys.all })
  queryClient.invalidateQueries({ queryKey: ["talent-profile"] })
  queryClient.invalidateQueries({ queryKey: ["job-application", "prefill"] })
}
