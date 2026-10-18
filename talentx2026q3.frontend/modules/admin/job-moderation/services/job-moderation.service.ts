import { apiClient } from "@/lib/api/axios";
import type {
  AdminJobDetails,
  AdminJobListItem,
  AdminJobsQueryParams,
  DeactivateJobPayload,
  PaginatedList,
  StatusUpdateResponse,
} from "../types/job-moderation";

export async function fetchAdminJobs(
  params: AdminJobsQueryParams
): Promise<PaginatedList<AdminJobListItem>> {
  const response = await apiClient.get<PaginatedList<AdminJobListItem>>(
    "/admin/jobs",
    { params }
  );
  return response.data;
}

export async function fetchAdminJobDetails(id: string): Promise<AdminJobDetails> {
  const response = await apiClient.get<AdminJobDetails>(`/admin/jobs/${id}`);
  return response.data;
}

export async function deactivateJob(
  id: string,
  payload: DeactivateJobPayload
): Promise<StatusUpdateResponse> {
  const response = await apiClient.patch<StatusUpdateResponse>(
    `/admin/jobs/${id}/deactivate`,
    payload
  );
  return response.data ?? {};
}

export async function reactivateJob(id: string): Promise<StatusUpdateResponse> {
  const response = await apiClient.patch<StatusUpdateResponse>(
    `/admin/jobs/${id}/reactivate`
  );
  return response.data ?? {};
}
