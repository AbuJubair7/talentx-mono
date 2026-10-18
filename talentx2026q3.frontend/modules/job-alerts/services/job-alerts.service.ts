import { apiClient } from '@/lib/api/axios';
import { JOB_ALERTS_API_ENDPOINTS } from '../constants';
import type { CreateJobAlertInput, JobAlert, UpdateJobAlertInput } from '../types';

export const jobAlertsService = {
  getJobAlerts: async (abortSignal?: AbortSignal): Promise<JobAlert[]> => {
    const response = await apiClient.get<JobAlert[]>(JOB_ALERTS_API_ENDPOINTS.JOB_ALERTS, {
      signal: abortSignal,
    });
    return response.data;
  },

  createJobAlert: async (payload: CreateJobAlertInput): Promise<string> => {
    const response = await apiClient.post<string>(JOB_ALERTS_API_ENDPOINTS.JOB_ALERTS, payload);
    return response.data;
  },

  updateJobAlert: async (id: string, payload: UpdateJobAlertInput): Promise<void> => {
    await apiClient.put(`${JOB_ALERTS_API_ENDPOINTS.JOB_ALERTS}/${id}`, payload);
  },

  toggleJobAlert: async (id: string, isEnabled: boolean): Promise<void> => {
    await apiClient.patch(`${JOB_ALERTS_API_ENDPOINTS.JOB_ALERTS}/${id}/toggle`, { isEnabled });
  },

  deleteJobAlert: async (id: string): Promise<void> => {
    await apiClient.delete(`${JOB_ALERTS_API_ENDPOINTS.JOB_ALERTS}/${id}`);
  },
};
