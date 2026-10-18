import { apiClient } from '@/lib/api/axios';
import type {
  AdminJobReportQueryParams,
  DismissJobReportPayload,
  JobReportDetails,
  JobReportListItem,
  PaginatedList,
  ResolveJobReportPayload,
  StatusUpdateResponse,
} from '../types/job-reports.types';

export const jobReportsService = {
  fetchReports: async (params: AdminJobReportQueryParams): Promise<PaginatedList<JobReportListItem>> => {
    const { data } = await apiClient.get<PaginatedList<JobReportListItem>>('/admin/job-reports', { params });
    return data;
  },

  fetchReportDetails: async (id: string): Promise<JobReportDetails> => {
    const { data } = await apiClient.get<JobReportDetails>(`/admin/job-reports/${id}`);
    return data;
  },

  resolveReport: async (id: string, payload: ResolveJobReportPayload): Promise<StatusUpdateResponse> => {
    const { data } = await apiClient.patch<StatusUpdateResponse>(`/admin/job-reports/${id}/resolve`, payload);
    return data;
  },

  dismissReport: async (id: string, payload: DismissJobReportPayload): Promise<StatusUpdateResponse> => {
    const { data } = await apiClient.patch<StatusUpdateResponse>(`/admin/job-reports/${id}/dismiss`, payload);
    return data;
  },
};
