'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ApiError } from '@/lib/api/axios';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';

export function useResubmitJob(explicitJobId?: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError | Error, string | void>({
    mutationFn: async (jobId?: string | void) => {
      const targetJobId = (typeof jobId === 'string' && jobId) || explicitJobId;
      if (!targetJobId) {
        throw new Error('Job ID is required to resubmit job.');
      }
      return employerJobsService.resubmitJob(targetJobId);
    },
    onSuccess: (_responseData, variables) => {
      const targetJobId = (typeof variables === 'string' && variables) || explicitJobId;
      queryClient.invalidateQueries({ queryKey: employerJobKeys.all });
      if (targetJobId) {
        queryClient.invalidateQueries({ queryKey: employerJobKeys.detail(targetJobId) });
      }
      toast.success("Sent for review. You'll get an email when an admin approves it.");
    },
    onError: (mutationError: ApiError | Error) => {
      // After the backend fix in 91ba1ff this message names the fields that are still missing.
      toast.error(mutationError.message || 'Failed to send job for review.');
    },
  });
}
