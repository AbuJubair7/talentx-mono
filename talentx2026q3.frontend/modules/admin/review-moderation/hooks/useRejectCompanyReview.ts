"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/axios";
import { rejectCompanyReview } from "../services/review-moderation.service";
import { adminCompanyReviewKeys } from "./useAdminCompanyReviews";
import type { ModerationReasonPayload } from "../types/review-moderation";

export function useRejectCompanyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ModerationReasonPayload }) =>
      rejectCompanyReview(id, payload),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminCompanyReviewKeys.all });
      queryClient.invalidateQueries({ queryKey: adminCompanyReviewKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminCompanyReviewKeys.stats() });
      toast.success(data.message || "Review rejected.");
    },
    onError: (mutationError: ApiError | Error) => {
      toast.error(mutationError.message || "Failed to reject review.");
    },
  });
}
