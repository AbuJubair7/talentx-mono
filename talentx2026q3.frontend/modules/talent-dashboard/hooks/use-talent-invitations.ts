"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTalentInvitations } from "../services/talent-dashboard.service";
import type { GetInvitationsParams, TalentInvitationsResponse } from "../types";

export function useTalentInvitations(params: GetInvitationsParams) {
  return useQuery<TalentInvitationsResponse>({
    queryKey: ["talent-invitations", params],
    queryFn: () => getTalentInvitations(params),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}