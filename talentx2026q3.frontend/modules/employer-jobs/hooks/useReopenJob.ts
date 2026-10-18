'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ApiError } from '@/lib/api/axios';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';

export function useReopenJob(explicitJobId?: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError | Error, string | void>({
    mutationFn: async (jobId?: string | void) => {
      const targetJobId = (typeof jobId === 'string' && jobId) || explicitJobId;
      if (!targetJobId) {
        throw new Error('Job ID is required to reopen job.');
      }
      return employerJobsService.reopenJob(targetJobId);
    },
    onSuccess: (_responseData, variables) => {
      const targetJobId = (typeof variables === 'string' && variables) || explicitJobId;
      queryClient.invalidateQueries({ queryKey: employerJobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-jobs'] });
      if (targetJobId) {
        queryClient.invalidateQueries({ queryKey: employerJobKeys.detail(targetJobId) });
      }
      toast.success('Job reopened successfully');
    },
    onError: (mutationError: ApiError | Error) => {
      toast.error(mutationError.message || 'Failed to reopen job.');
    },
  });
}
