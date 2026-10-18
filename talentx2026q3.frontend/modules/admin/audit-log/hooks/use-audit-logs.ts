import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchAuditLogs } from "../services/audit-log.service";
import type { AuditLogsQueryParams } from "../types/audit-log";

export const auditLogKeys = {
  all: ["admin", "audit-logs"] as const,
  list: (params: AuditLogsQueryParams) =>
    [...auditLogKeys.all, "list", params] as const,
};

export function useAuditLogs(params: AuditLogsQueryParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => fetchAuditLogs(params),
    placeholderData: keepPreviousData,
  });
}
