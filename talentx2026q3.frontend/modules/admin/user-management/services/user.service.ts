import { apiClient } from "@/lib/api/axios";
import type {
  AdminAccountStatus,
  AdminUserDetails,
  AdminUserListItem,
  AdminUserStats,
  PaginatedList,
  StatusUpdateResponse,
  UsersQueryParams,
} from "../types/user";

export async function fetchAdminUsers(
  params: UsersQueryParams
): Promise<PaginatedList<AdminUserListItem>> {
  const response = await apiClient.get<PaginatedList<AdminUserListItem>>(
    "/admin/users",
    { params }
  );
  return response.data;
}

export async function fetchAdminUserDetails(
  id: string
): Promise<AdminUserDetails> {
  const response = await apiClient.get<AdminUserDetails>(
    `/admin/users/${id}`
  );
  return response.data;
}

export async function fetchAdminUserStats(): Promise<AdminUserStats> {
  const response = await apiClient.get<AdminUserStats>(
    "/admin/users/stats"
  );
  return response.data;
}

export async function updateUserAccountStatus(
  id: string,
  newStatus: AdminAccountStatus
): Promise<StatusUpdateResponse> {
  const response = await apiClient.patch<StatusUpdateResponse>(
    `/admin/users/${id}/status`,
    { newStatus }
  );
  return response.data ?? {};
}
