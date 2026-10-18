'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { ApiError } from '@/lib/api/axios';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';

export function useCloseJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => employerJobsService.closeJob(jobId),
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: employerJobKeys.all });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-jobs'] });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: employerJobKeys.detail(jobId) });
      }
      toast.success('Job closed successfully.');
    },
    onError: (mutationError: ApiError | Error) => {
      toast.error(mutationError.message || 'Failed to close job.');
    },
  });
}
