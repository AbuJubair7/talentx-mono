import {
  getTalentApplications,
  getTalentApplicationCounts,
} from '../services/talent-dashboard.service';
import { apiClient } from '@/lib/api/axios';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('talent-dashboard.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTalentApplications', () => {
    it('returns applications without search parameter', async () => {
      const mockResult = {
        items: [
          {
            id: 'app-1',
            jobId: 'j-1',
            jobTitle: 'Frontend Dev',
            company: 'Acme Corp',
            appliedDate: '2026-09-01T12:00:00Z',
            status: 'Applied',
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 1,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockResult } as any);

      const result = await getTalentApplications({
        status: 'All',
        page: 1,
        pageSize: 10,
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/talent/dashboard/applications',
        {
          params: {
            status: undefined,
            page: 1,
            pageSize: 10,
          },
        }
      );
      expect(result).toEqual(mockResult);
    });

    it('filters the current page by search query on company and role', async () => {
      const mockRawItems = [
        {
          id: 'app-1',
          jobId: 'j-1',
          jobTitle: 'Senior React Engineer',
          company: 'Acme Corp',
          appliedDate: '2026-09-01T12:00:00Z',
          status: 'Applied',
        },
        {
          id: 'app-2',
          jobId: 'j-2',
          jobTitle: 'Backend Go Engineer',
          company: 'Stripe',
          appliedDate: '2026-09-02T12:00:00Z',
          status: 'Interview',
        },
        {
          id: 'app-3',
          jobId: 'j-3',
          jobTitle: 'DevOps Specialist',
          company: 'React Systems',
          appliedDate: '2026-09-03T12:00:00Z',
          status: 'Applied',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          items: mockRawItems,
          page: 1,
          pageSize: 10,
          totalCount: 3,
        },
      } as any);

      // Search matching "React" (found in app-1 jobTitle, app-3 company)
      const result = await getTalentApplications({
        status: 'All',
        search: 'react',
        page: 1,
        pageSize: 10,
      });

      // Search is a current-page filter: server page is requested as-is,
      // then filtered locally with the pagination hidden by the caller.
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/talent/dashboard/applications',
        {
          params: {
            status: undefined,
            page: 1,
            pageSize: 10,
          },
        }
      );
      expect(result.items.length).toBe(2);
      expect(result.totalCount).toBe(2);
      expect(result.items[0].id).toBe('app-1');
      expect(result.items[1].id).toBe('app-3');
    });
  });

  describe('getTalentApplicationCounts', () => {
    it('aggregates total counts for each application status via parallel queries', async () => {
      mockApiClient.get
        .mockResolvedValueOnce({ data: { totalCount: 20 } } as any) // All
        .mockResolvedValueOnce({ data: { totalCount: 10 } } as any) // Applied
        .mockResolvedValueOnce({ data: { totalCount: 4 } } as any)  // Interview
        .mockResolvedValueOnce({ data: { totalCount: 2 } } as any)  // Hired
        .mockResolvedValueOnce({ data: { totalCount: 4 } } as any); // Rejected

      const counts = await getTalentApplicationCounts();

      expect(mockApiClient.get).toHaveBeenCalledTimes(5);
      expect(counts).toEqual({
        total: 20,
        applied: 10,
        interviews: 4,
        offers: 2,
        rejected: 4,
      });
    });

    it('throws on error so the UI can show a retry state instead of silent zeros', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getTalentApplicationCounts()).rejects.toThrow();
    });
  });
});
