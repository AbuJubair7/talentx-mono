import { useQuery } from "@tanstack/react-query";
import { fetchAdminCompanyReviewStats } from "../services/review-moderation.service";
import { adminCompanyReviewKeys } from "./useAdminCompanyReviews";

export function useAdminCompanyReviewStats() {
  return useQuery({
    queryKey: adminCompanyReviewKeys.stats(),
    queryFn: () => fetchAdminCompanyReviewStats(),
  });
}
