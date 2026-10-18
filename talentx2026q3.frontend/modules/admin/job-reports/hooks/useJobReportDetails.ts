import { useQuery } from '@tanstack/react-query';
import { adminJobReportKeys } from './query-keys';
import { jobReportsService } from '../services/job-reports.service';

export const useJobReportDetails = (id: string) => {
  return useQuery({
    queryKey: adminJobReportKeys.detail(id),
    queryFn: () => jobReportsService.fetchReportDetails(id),
    enabled: Boolean(id),
  });
};
