import { apiClient } from '@/lib/api/axios';
import { employerJobsService } from '../employer-jobs.service';
import type {
  EmployerDashboardDto,
  EmployerJob,
  EmployerJobListItemDto,
  EmployerJobsQueryParams,
  PaginatedList,
} from '../../types/employer-job.types';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPatch = jest.mocked(apiClient.patch);
const mockedDelete = jest.mocked(apiClient.delete);

afterEach(() => {
  jest.clearAllMocks();
});

describe('employerJobsService', () => {
  const sampleDashboardPayload: EmployerDashboardDto = {
    totalPostedJobs: 12,
    totalHires: 3,
    activeJobsCount: 5,
    draftJobsCount: 2,
    closedJobsCount: 4,
    expiredJobsCount: 1,
    deactivatedJobsCount: 0,
    pendingReviewJobsCount: 0,
    recentJobs: [
      {
        id: 'job-uuid-1',
        title: 'Senior AI Engineer',
        status: 'Published',
        createdAt: '2026-09-01T10:00:00.000Z',
        expireAt: '2026-10-01T10:00:00.000Z',
        vacancies: 2,
        applicantCount: 8,
      },
    ],
  };

  const sampleJobListItem: EmployerJobListItemDto = {
    id: 'job-uuid-1',
    title: 'Senior AI Engineer',
    companyName: 'Acme Corp',
    status: 'Published',
    employmentType: 'FullTime',
    workArrangement: 'FullRemote',
    experienceLevel: 'SeniorLevel',
    location: 'Remote',
    vacancies: 2,
    expireAt: '2026-10-01T10:00:00.000Z',
    createdAt: '2026-09-01T10:00:00.000Z',
    applicantCount: 8,
  };

  const samplePaginatedJobsPayload: PaginatedList<EmployerJobListItemDto> = {
    items: [sampleJobListItem],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  const sampleJobDetailPayload: EmployerJob = {
    id: 'job-uuid-1',
    title: 'Senior AI Engineer',
    companyName: 'Acme Corp',
    description: 'Design and deploy LLM applications.',
    location: 'Remote',
    employmentType: 'FullTime',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'FullRemote',
    requiredSkills: ['Python', 'PyTorch'],
    vacancies: 2,
    status: 'Published',
    createdAt: '2026-09-01T10:00:00.000Z',
    expireAt: '2026-10-01T10:00:00.000Z',
  };

  describe('getDashboard', () => {
    it('calls GET /employers/dashboard and returns the dashboard payload', async () => {
      mockedGet.mockResolvedValueOnce({ data: sampleDashboardPayload });

      const abortController = new AbortController();
      const actualDashboard = await employerJobsService.getDashboard(abortController.signal);

      expect(mockedGet).toHaveBeenCalledTimes(1);
      expect(mockedGet).toHaveBeenCalledWith('/employers/dashboard', {
        signal: abortController.signal,
      });
      expect(actualDashboard).toEqual(sampleDashboardPayload);
    });

    it('propagates an error when getDashboard fails', async () => {
      mockedGet.mockRejectedValueOnce(new Error('Network error'));

      await expect(employerJobsService.getDashboard()).rejects.toThrow('Network error');
    });
  });

  describe('getJobs', () => {
    it('calls GET /employers/jobs with query parameters and returns paginated jobs', async () => {
      mockedGet.mockResolvedValueOnce({ data: samplePaginatedJobsPayload });

      const queryParameters: EmployerJobsQueryParams = {
        page: 2,
        pageSize: 5,
        status: 'Published',
        isExpired: false,
      };
      const abortController = new AbortController();
      const actualJobsResult = await employerJobsService.getJobs(queryParameters, abortController.signal);

      expect(mockedGet).toHaveBeenCalledTimes(1);
      expect(mockedGet).toHaveBeenCalledWith('/employers/jobs', {
        params: queryParameters,
        signal: abortController.signal,
      });
      expect(actualJobsResult).toEqual(samplePaginatedJobsPayload);
    });

    it('calls GET /employers/jobs without query parameters when omitted', async () => {
      mockedGet.mockResolvedValueOnce({ data: samplePaginatedJobsPayload });

      const actualJobsResult = await employerJobsService.getJobs();

      expect(mockedGet).toHaveBeenCalledWith('/employers/jobs', {
        params: undefined,
        signal: undefined,
      });
      expect(actualJobsResult).toEqual(samplePaginatedJobsPayload);
    });

    it('propagates an error when getJobs fails', async () => {
      mockedGet.mockRejectedValueOnce(new Error('Failed to fetch jobs'));

      await expect(employerJobsService.getJobs()).rejects.toThrow('Failed to fetch jobs');
    });
  });

  describe('closeJob', () => {
    it('calls PATCH /jobs/:id/status with target job identifier', async () => {
      mockedPatch.mockResolvedValueOnce({ data: undefined });

      const targetJobIdentifier = 'job-uuid-123';
      await employerJobsService.closeJob(targetJobIdentifier);

      expect(mockedPatch).toHaveBeenCalledTimes(1);
      expect(mockedPatch).toHaveBeenCalledWith('/jobs/job-uuid-123/status');
    });

    it('propagates an error when closeJob fails', async () => {
      mockedPatch.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(employerJobsService.closeJob('job-uuid-123')).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteJob', () => {
    it('calls DELETE /jobs/:id with target job identifier', async () => {
      mockedDelete.mockResolvedValueOnce({ data: undefined });

      const targetJobIdentifier = 'job-uuid-456';
      await employerJobsService.deleteJob(targetJobIdentifier);

      expect(mockedDelete).toHaveBeenCalledTimes(1);
      expect(mockedDelete).toHaveBeenCalledWith('/jobs/job-uuid-456');
    });

    it('propagates an error when deleteJob fails', async () => {
      mockedDelete.mockRejectedValueOnce(new Error('Job not found'));

      await expect(employerJobsService.deleteJob('job-uuid-456')).rejects.toThrow('Job not found');
    });
  });

  describe('reopenJob', () => {
    it('calls PATCH /jobs/:id/reopen with target job identifier', async () => {
      mockedPatch.mockResolvedValueOnce({ data: undefined });

      const targetJobIdentifier = 'job-uuid-789';
      await employerJobsService.reopenJob(targetJobIdentifier);

      expect(mockedPatch).toHaveBeenCalledTimes(1);
      expect(mockedPatch).toHaveBeenCalledWith('/jobs/job-uuid-789/reopen');
    });

    it('propagates an error when reopenJob fails', async () => {
      mockedPatch.mockRejectedValueOnce(new Error('Cannot reopen expired job'));

      await expect(employerJobsService.reopenJob('job-uuid-789')).rejects.toThrow('Cannot reopen expired job');
    });
  });

  describe('publishJob', () => {
    it('calls PATCH /jobs/:id with publish true payload', async () => {
      mockedPatch.mockResolvedValueOnce({ data: undefined });

      const mockJobId = 'job-uuid-101';
      await employerJobsService.publishJob(mockJobId);

      expect(mockedPatch).toHaveBeenCalledTimes(1);
      expect(mockedPatch).toHaveBeenCalledWith('/jobs/job-uuid-101/publish');
    });

    it('propagates an error when publishJob fails', async () => {
      mockedPatch.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(employerJobsService.publishJob('job-uuid-101')).rejects.toThrow('Validation failed');
    });
  });

  describe('getMyJobById', () => {
    it('calls GET /jobs/mine/:id and returns the job details payload', async () => {
      mockedGet.mockResolvedValueOnce({ data: sampleJobDetailPayload });

      const targetJobIdentifier = 'job-uuid-1';
      const abortController = new AbortController();
      const actualJobDetail = await employerJobsService.getMyJobById(targetJobIdentifier, abortController.signal);

      expect(mockedGet).toHaveBeenCalledTimes(1);
      expect(mockedGet).toHaveBeenCalledWith('/jobs/mine/job-uuid-1', {
        signal: abortController.signal,
      });
      expect(actualJobDetail).toEqual(sampleJobDetailPayload);
    });

    it('falls back to GET /jobs/:id when /jobs/mine/:id fails', async () => {
      mockedGet.mockRejectedValueOnce(new Error('Mine not found'));
      mockedGet.mockResolvedValueOnce({ data: sampleJobDetailPayload });

      const targetJobIdentifier = 'job-uuid-2';
      const actualJobDetail = await employerJobsService.getMyJobById(targetJobIdentifier);

      expect(mockedGet).toHaveBeenCalledWith('/jobs/mine/job-uuid-2', {
        signal: undefined,
      });
      expect(mockedGet).toHaveBeenCalledWith('/jobs/job-uuid-2', {
        signal: undefined,
      });
      expect(actualJobDetail).toEqual(sampleJobDetailPayload);
    });
  });

  describe('getMyJobs', () => {
    it('delegates to GET /employers/jobs and returns the jobs array', async () => {
      mockedGet.mockResolvedValueOnce({ data: { items: [sampleJobListItem] } });

      const actualJobsList = await employerJobsService.getMyJobs();

      expect(mockedGet).toHaveBeenCalledWith('/employers/jobs', {
        signal: undefined,
      });
      expect(actualJobsList).toEqual([sampleJobListItem]);
    });
  });
});
