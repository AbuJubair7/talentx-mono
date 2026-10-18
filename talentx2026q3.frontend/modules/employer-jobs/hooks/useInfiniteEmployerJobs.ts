'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { employerJobsService } from '../services/employer-jobs.service';
import type { EmployerJobsQueryParams } from '../types/employer-job.types';
import { employerJobKeys } from './query-keys';

export function useInfiniteEmployerJobs(queryParams?: EmployerJobsQueryParams) {
  const { page: _currentPageNumber, ...infiniteFilters } = queryParams ?? {};
  return useInfiniteQuery({
    queryKey: employerJobKeys.jobsInfinite(infiniteFilters),
    queryFn: ({ pageParam, signal: abortSignal }) =>
      employerJobsService.getJobs(
        { ...infiniteFilters, page: pageParam },
        abortSignal
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
}
