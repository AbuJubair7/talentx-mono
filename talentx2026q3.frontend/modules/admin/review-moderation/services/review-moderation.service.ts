import { apiClient } from "@/lib/api/axios";
import type {
  AdminCompanyReviewDetails,
  AdminCompanyReviewListItem,
  AdminCompanyReviewsQueryParams,
  AdminCompanyReviewStats,
  ModerationReasonPayload,
  PaginatedList,
  StatusUpdateResponse,
} from "../types/review-moderation";

export async function fetchAdminCompanyReviews(
  params: AdminCompanyReviewsQueryParams
): Promise<PaginatedList<AdminCompanyReviewListItem>> {
  const response = await apiClient.get<PaginatedList<AdminCompanyReviewListItem>>(
    "/admin/company-reviews",
    { params }
  );
  return response.data;
}

export async function fetchAdminCompanyReviewStats(): Promise<AdminCompanyReviewStats> {
  const response = await apiClient.get<AdminCompanyReviewStats>(
    "/admin/company-reviews/stats"
  );
  return response.data;
}

export async function fetchAdminCompanyReviewDetails(
  id: string
): Promise<AdminCompanyReviewDetails> {
  const response = await apiClient.get<AdminCompanyReviewDetails>(
    `/admin/company-reviews/${id}`
  );
  return response.data;
}

export async function approveCompanyReview(id: string): Promise<StatusUpdateResponse> {
  const response = await apiClient.patch<StatusUpdateResponse>(
    `/admin/company-reviews/${id}/approve`
  );
  return response.data ?? {};
}

export async function rejectCompanyReview(
  id: string,
  payload: ModerationReasonPayload
): Promise<StatusUpdateResponse> {
  const response = await apiClient.patch<StatusUpdateResponse>(
    `/admin/company-reviews/${id}/reject`,
    payload
  );
  return response.data ?? {};
}

export async function hideCompanyReview(
  id: string,
  payload: ModerationReasonPayload
): Promise<StatusUpdateResponse> {
  const response = await apiClient.patch<StatusUpdateResponse>(
    `/admin/company-reviews/${id}/hide`,
    payload
  );
  return response.data ?? {};
}

export async function unhideCompanyReview(id: string): Promise<StatusUpdateResponse> {
  const response = await apiClient.patch<StatusUpdateResponse>(
    `/admin/company-reviews/${id}/unhide`
  );
  return response.data ?? {};
}
