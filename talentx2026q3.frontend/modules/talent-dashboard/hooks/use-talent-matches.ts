"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTalentMatches } from "../services/talent-dashboard.service";
import type { GetMatchesParams, TalentMatchesResponse } from "../types";

export function useTalentMatches(params: GetMatchesParams) {
  return useQuery<TalentMatchesResponse>({
    queryKey: ["talent-matches", params],
    queryFn: () => getTalentMatches(params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}