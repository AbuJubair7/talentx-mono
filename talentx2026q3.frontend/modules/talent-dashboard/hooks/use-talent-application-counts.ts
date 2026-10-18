"use client";

import { useQuery } from "@tanstack/react-query";
import { getTalentApplicationCounts } from "../services/talent-dashboard.service";
import type { TalentApplicationCounts } from "../types";

export function useTalentApplicationCounts() {
  return useQuery<TalentApplicationCounts>({
    queryKey: ["talent-application-counts"],
    queryFn: () => getTalentApplicationCounts(),
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
