'use client';

import { useQuery } from '@tanstack/react-query';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';

export function useEmployerDashboard() {
  return useQuery({
    queryKey: employerJobKeys.dashboard(),
    queryFn: ({ signal: abortSignal }) => employerJobsService.getDashboard(abortSignal),
    staleTime: 60 * 1000,
  });
}
