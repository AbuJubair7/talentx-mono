'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { employerJobsService } from '../services/employer-jobs.service';
import type { EmployerJobsQueryParams } from '../types/employer-job.types';
import { employerJobKeys } from './query-keys';

export function useEmployerJobs(queryParams?: EmployerJobsQueryParams) {
  return useQuery({
    queryKey: employerJobKeys.jobsList(queryParams),
    queryFn: ({ signal: abortSignal }) => employerJobsService.getJobs(queryParams, abortSignal),
    placeholderData: keepPreviousData,
  });
}
