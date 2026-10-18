import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAdminCompanyReviews } from "../services/review-moderation.service";
import type { AdminCompanyReviewsQueryParams } from "../types/review-moderation";

export const adminCompanyReviewKeys = {
  all: ["admin", "company-reviews"] as const,
  list: (params: AdminCompanyReviewsQueryParams) =>
    [...adminCompanyReviewKeys.all, "list", params] as const,
  detail: (id: string) => [...adminCompanyReviewKeys.all, "detail", id] as const,
  stats: () => [...adminCompanyReviewKeys.all, "stats"] as const,
};

export function useAdminCompanyReviews(params: AdminCompanyReviewsQueryParams) {
  return useQuery({
    queryKey: adminCompanyReviewKeys.list(params),
    queryFn: () => fetchAdminCompanyReviews(params),
    // Keeps the current page on screen while the next page or a new search loads.
    placeholderData: keepPreviousData,
  });
}
