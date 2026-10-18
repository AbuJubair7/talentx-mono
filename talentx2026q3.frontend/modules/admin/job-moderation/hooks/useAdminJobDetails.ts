import { useQuery } from "@tanstack/react-query";
import { fetchAdminJobDetails } from "../services/job-moderation.service";
import { adminJobKeys } from "./useAdminJobs";

// The detail dialog passes an id only while it's open, so nothing is fetched until then.
export function useAdminJobDetails(id: string | undefined) {
  return useQuery({
    queryKey: adminJobKeys.detail(id ?? ""),
    queryFn: () => fetchAdminJobDetails(id as string),
    enabled: Boolean(id),
    // A 404 means the job left moderation (closed, deleted, back to draft); retrying won't help.
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number | null })?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
}
