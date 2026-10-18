import type { AdminJobReportQueryParams } from '../types/job-reports.types';

export const adminJobReportKeys = {
  all: ['admin', 'jobReports'] as const,
  list: (params: AdminJobReportQueryParams) => [...adminJobReportKeys.all, 'list', params] as const,
  detail: (id: string) => [...adminJobReportKeys.all, 'detail', id] as const,
};
