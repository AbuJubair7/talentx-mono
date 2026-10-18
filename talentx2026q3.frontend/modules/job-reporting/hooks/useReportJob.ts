'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jobReportingService } from '../services/job-reporting.service';
import type { JobReportConfirmation, ReportJobPayload } from '../types/job-reporting.types';
import { jobReportKeys } from './query-keys';

export function useReportJob(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation<JobReportConfirmation, Error, ReportJobPayload>({
    mutationFn: (payload) => jobReportingService.reportJob(jobId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: jobReportKeys.forJob(jobId) });
      toast.success(response.message || 'Thank you for reporting this job. Our team will review it.');
    },
    onError: (error: Error) => {
      const message = error?.message || 'Failed to submit report. Please try again.';
      toast.error(message);
    },
  });
}
