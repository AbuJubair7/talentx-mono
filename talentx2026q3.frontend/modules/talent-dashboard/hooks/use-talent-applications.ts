"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTalentApplications } from "../services/talent-dashboard.service";
import type { GetApplicationsParams, TalentApplicationsResponse } from "../types";

export function useTalentApplications(params: GetApplicationsParams) {
  return useQuery<TalentApplicationsResponse>({
    queryKey: ["talent-applications", params],
    queryFn: () => getTalentApplications(params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}