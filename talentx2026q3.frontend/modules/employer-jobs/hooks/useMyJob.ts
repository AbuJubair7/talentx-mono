'use client';

import { useQuery } from '@tanstack/react-query';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';

export function useMyJob(id: string) {
  return useQuery({
    queryKey: employerJobKeys.detail(id),
    queryFn: () => employerJobsService.getMyJobById(id),
    enabled: Boolean(id),
    retry: (failureCount, error: unknown) => {
      const status =
        (error as { status?: number | null })?.status ??
        (error as { response?: { status?: number } })?.response?.status;
      const message = (error as { message?: string })?.message;

      if (
        status === 404 ||
        message === 'Not Found' ||
        message?.toLowerCase().includes('not found')
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
