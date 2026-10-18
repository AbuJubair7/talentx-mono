export const jobReportKeys = {
  all: ['jobReports'] as const,
  forJob: (jobId: string) => [...jobReportKeys.all, 'job', jobId] as const,
};
