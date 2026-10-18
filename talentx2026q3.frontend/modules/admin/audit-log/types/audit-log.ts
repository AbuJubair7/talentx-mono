export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  isSystem: boolean;
  action: string;
  ipAddress?: string | null;
}

export interface AuditLogsQueryParams {
  searchQuery?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
