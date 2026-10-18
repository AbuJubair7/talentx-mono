import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobReportsService } from '../services/job-reports.service';
import { adminJobReportKeys } from './query-keys';
import { toast } from 'sonner';
import type { DismissJobReportPayload } from '../types/job-reports.types';

export const useDismissJobReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DismissJobReportPayload }) =>
      jobReportsService.dismissReport(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminJobReportKeys.all });
      toast.success(data.message || 'Report dismissed.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to dismiss report.');
    },
  });
};
