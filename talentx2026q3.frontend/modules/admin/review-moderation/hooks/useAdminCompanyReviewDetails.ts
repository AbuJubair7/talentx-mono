import { useQuery } from "@tanstack/react-query";
import { fetchAdminCompanyReviewDetails } from "../services/review-moderation.service";
import { adminCompanyReviewKeys } from "./useAdminCompanyReviews";

// The detail dialog passes an id only while it's open, so nothing is fetched until then.
export function useAdminCompanyReviewDetails(id: string | undefined) {
  return useQuery({
    queryKey: adminCompanyReviewKeys.detail(id ?? ""),
    queryFn: () => fetchAdminCompanyReviewDetails(id as string),
    enabled: Boolean(id),
    // A 404 means the review left moderation (e.g. deleted with its account); retrying won't help.
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number | null })?.status;
      if (status === 404) return false;
      return failureCount < 1;
    },
  });
}
