import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminJobs } from "../services/job-moderation.service";
import type { AdminJobsQueryParams } from "../types/job-moderation";

export const adminJobKeys = {
  all: ["admin", "jobs"] as const,
  list: (params: AdminJobsQueryParams) => [...adminJobKeys.all, "list", params] as const,
  detail: (id: string) => [...adminJobKeys.all, "detail", id] as const,
};

export function useAdminJobs(params: AdminJobsQueryParams) {
  return useQuery({
    queryKey: adminJobKeys.list(params),
    queryFn: () => fetchAdminJobs(params),
    // Keeps the current page on screen while the next page or a new search loads.
    placeholderData: keepPreviousData,
  });
}
