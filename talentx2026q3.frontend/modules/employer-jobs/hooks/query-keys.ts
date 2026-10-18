import type { EmployerJobsQueryParams } from '../types/employer-job.types';

export const employerJobKeys = {
  all: ['employer'] as const,
  dashboard: () => [...employerJobKeys.all, 'dashboard'] as const,
  jobs: () => [...employerJobKeys.all, 'jobs'] as const,
  jobsList: (queryParams?: EmployerJobsQueryParams) =>
    [...employerJobKeys.jobs(), queryParams] as const,
  jobsInfinite: (queryParams?: EmployerJobsQueryParams) =>
    [...employerJobKeys.jobs(), 'infinite', queryParams] as const,
  detail: (jobId: string) => [...employerJobKeys.jobs(), jobId] as const,
  pipelineSummary: (jobId: string) => [...employerJobKeys.jobs(), jobId, 'pipeline-summary'] as const,
};
