import { useQuery } from '@tanstack/react-query';
import { adminJobReportKeys } from './query-keys';
import { jobReportsService } from '../services/job-reports.service';
import type { AdminJobReportQueryParams } from '../types/job-reports.types';

export const useJobReports = (params: AdminJobReportQueryParams) => {
  return useQuery({
    queryKey: adminJobReportKeys.list(params),
    queryFn: () => jobReportsService.fetchReports(params),
  });
};
