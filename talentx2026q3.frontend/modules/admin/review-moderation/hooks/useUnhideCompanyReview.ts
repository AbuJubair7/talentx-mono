"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/axios";
import { unhideCompanyReview } from "../services/review-moderation.service";
import { adminCompanyReviewKeys } from "./useAdminCompanyReviews";

export function useUnhideCompanyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unhideCompanyReview(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminCompanyReviewKeys.all });
      queryClient.invalidateQueries({ queryKey: adminCompanyReviewKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminCompanyReviewKeys.stats() });
      toast.success(data.message || "Review unhidden.");
    },
    onError: (mutationError: ApiError | Error) => {
      toast.error(mutationError.message || "Failed to unhide review.");
    },
  });
}
