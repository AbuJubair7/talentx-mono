import { apiClient } from '@/lib/api/axios';
import type { JobReportConfirmation, ReportJobPayload } from '../types/job-reporting.types';

export const jobReportingService = {
  reportJob: async (jobId: string, payload: ReportJobPayload): Promise<JobReportConfirmation> => {
    const { data } = await apiClient.post<JobReportConfirmation>(`/jobs/${jobId}/report`, payload);
    return data;
  },
};
