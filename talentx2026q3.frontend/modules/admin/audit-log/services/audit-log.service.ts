import { apiClient } from "@/lib/api/axios";
import type { AuditLogsQueryParams, PaginatedList, AuditLogItem } from "../types/audit-log";

export async function fetchAuditLogs(
  params: AuditLogsQueryParams
): Promise<PaginatedList<AuditLogItem>> {
  const response = await apiClient.get<PaginatedList<AuditLogItem>>(
    "/admin/audit-logs",
    { params }
  );
  return response.data;
}
