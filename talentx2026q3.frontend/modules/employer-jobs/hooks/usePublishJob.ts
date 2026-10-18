'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ApiError } from '@/lib/api/axios';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';

export function usePublishJob(explicitJobId?: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError | Error, string | void>({
    mutationFn: async (jobId?: string | void) => {
      const targetJobId = (typeof jobId === 'string' && jobId) || explicitJobId;
      if (!targetJobId) {
        throw new Error('Job ID is required to publish job.');
      }
      return employerJobsService.publishJob(targetJobId);
    },
    onSuccess: (_responseData, variables) => {
      const targetJobId = (typeof variables === 'string' && variables) || explicitJobId;
      queryClient.invalidateQueries({ queryKey: employerJobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-jobs'] });
      if (targetJobId) {
        queryClient.invalidateQueries({ queryKey: employerJobKeys.detail(targetJobId) });
      }
      toast.success('Job published successfully');
    },
    onError: (mutationError: ApiError | Error) => {
      const apiError = mutationError as ApiError;
      const fieldErrors = apiError.errors && apiError.errors.length > 0
        ? apiError.errors.join(' ')
        : undefined;
      toast.error(apiError.message || 'Failed to publish job.', {
        description: fieldErrors,
      });
    },
  });
}
