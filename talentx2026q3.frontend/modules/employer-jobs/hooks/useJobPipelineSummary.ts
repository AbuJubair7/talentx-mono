'use client';

import { useQuery } from '@tanstack/react-query';

import { employerJobsService } from '../services/employer-jobs.service';
import { employerJobKeys } from './query-keys';

export function useJobPipelineSummary(jobId: string | null) {
  return useQuery({
    queryKey: jobId ? employerJobKeys.pipelineSummary(jobId) : ['job-pipeline-summary', null],
    queryFn: ({ signal: abortSignal }) => employerJobsService.getJobPipelineSummary(jobId!, abortSignal),
    enabled: Boolean(jobId),
    staleTime: 30 * 1000,
  });
}
