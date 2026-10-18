import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobReportsService } from '../services/job-reports.service';
import { adminJobReportKeys } from './query-keys';
import { toast } from 'sonner';
import type { ResolveJobReportPayload } from '../types/job-reports.types';

export const useResolveJobReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveJobReportPayload }) =>
      jobReportsService.resolveReport(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminJobReportKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'jobs'] });
      toast.success(data.message || 'Job deactivated and report resolved.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resolve report.');
    },
  });
};
