import { apiClient } from '@/lib/api/axios';
import { jobAlertsService } from '../job-alerts.service';
import type { CreateJobAlertInput, JobAlert, UpdateJobAlertInput } from '../../types';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPost = jest.mocked(apiClient.post);
const mockedPut = jest.mocked(apiClient.put);
const mockedPatch = jest.mocked(apiClient.patch);
const mockedDelete = jest.mocked(apiClient.delete);

describe('jobAlertsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const sampleAlert: JobAlert = {
    id: 'alert-uuid-1',
    name: 'Backend Alerts',
    title: '.NET Engineer',
    location: 'Remote',
    employmentType: 'FullTime',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'FullRemote',
    isEnabled: true,
    createdAt: '2026-09-14T10:00:00.000Z',
  };

  it('getJobAlerts calls GET /job-alerts with abort signal', async () => {
    mockedGet.mockResolvedValueOnce({ data: [sampleAlert] });
    const controller = new AbortController();

    const alerts = await jobAlertsService.getJobAlerts(controller.signal);

    expect(mockedGet).toHaveBeenCalledWith('/job-alerts', {
      signal: controller.signal,
    });
    expect(alerts).toEqual([sampleAlert]);
  });

  it('createJobAlert calls POST /job-alerts with payload', async () => {
    const payload: CreateJobAlertInput = {
      name: 'Backend Alerts',
      title: '.NET Engineer',
      location: 'Remote',
      employmentType: 'FullTime',
      experienceLevel: 'SeniorLevel',
      workArrangement: 'FullRemote',
    };
    mockedPost.mockResolvedValueOnce({ data: 'new-alert-uuid' });

    const createdId = await jobAlertsService.createJobAlert(payload);

    expect(mockedPost).toHaveBeenCalledWith('/job-alerts', payload);
    expect(createdId).toBe('new-alert-uuid');
  });

  it('updateJobAlert calls PUT /job-alerts/{id} with payload', async () => {
    const payload: UpdateJobAlertInput = {
      name: 'Updated Alerts',
      title: 'Lead .NET Engineer',
      location: 'Hybrid',
      employmentType: 'FullTime',
      experienceLevel: 'Lead',
      workArrangement: 'Hybrid',
    };
    mockedPut.mockResolvedValueOnce({ data: undefined });

    await jobAlertsService.updateJobAlert('alert-uuid-1', payload);

    expect(mockedPut).toHaveBeenCalledWith('/job-alerts/alert-uuid-1', payload);
  });

  it('toggleJobAlert calls PATCH /job-alerts/{id}/toggle with isEnabled', async () => {
    mockedPatch.mockResolvedValueOnce({ data: undefined });

    await jobAlertsService.toggleJobAlert('alert-uuid-1', false);

    expect(mockedPatch).toHaveBeenCalledWith('/job-alerts/alert-uuid-1/toggle', {
      isEnabled: false,
    });
  });

  it('deleteJobAlert calls DELETE /job-alerts/{id}', async () => {
    mockedDelete.mockResolvedValueOnce({ data: undefined });

    await jobAlertsService.deleteJobAlert('alert-uuid-1');

    expect(mockedDelete).toHaveBeenCalledWith('/job-alerts/alert-uuid-1');
  });
});
