"use client";

import { useQuery } from "@tanstack/react-query";
import { getApplicationStatusHistory } from "../services/talent-dashboard.service";
import type { ApplicationStatusHistoryEvent } from "../types";

export function useApplicationStatusHistory(applicationId: string) {
  return useQuery<ApplicationStatusHistoryEvent[]>({
    queryKey: ["talent-application-status-history", applicationId],
    queryFn: ({ signal }) => getApplicationStatusHistory(applicationId, signal),
    enabled: Boolean(applicationId?.trim()),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
