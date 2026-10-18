import { apiClient } from '@/lib/api/axios';
import { companyProfileService } from '../company-profile.service';
import type { CompanyProfileDto } from '../../types/company-profile.types';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
  parseApiError: jest.fn((e: unknown) => e),
}));

describe('companyProfileService', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  const mockCompany: CompanyProfileDto = {
    id: companyId,
    employerId: 'emp-456',
    name: 'Test Corp',
    logoUrl: 'https://test.com/logo.png',
    description: 'A test corporation.',
    industry: 'Technology & Software',
    companySize: '51-200',
    website: 'https://test.com',
    location: 'New York, NY',
    linkedIn: 'https://linkedin.com/company/test',
    twitter: null,
    facebook: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyCompanyProfile', () => {
    it('returns company profile data on successful GET /employers/company', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockCompany,
      });

      const result = await companyProfileService.getMyCompanyProfile();
      expect(apiClient.get).toHaveBeenCalledWith('/employers/company', {
        signal: undefined,
      });
      expect(result.name).toBe('Test Corp');
    });

    it('throws when GET /employers/company fails (no mock fallback)', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(companyProfileService.getMyCompanyProfile()).rejects.toThrow();
    });
  });

  describe('updateMyCompanyProfile', () => {
    it('calls PUT /employers/company with backend command shape', async () => {
      (apiClient.put as jest.Mock).mockResolvedValueOnce({
        data: { ...mockCompany, name: 'Updated Corp' },
      });

      const result = await companyProfileService.updateMyCompanyProfile({
        companyName: 'Updated Corp',
        description: 'New description',
      });

      expect(apiClient.put).toHaveBeenCalledWith(
        '/employers/company',
        expect.objectContaining({ companyName: 'Updated Corp' }),
        { signal: undefined },
      );
      expect(result.name).toBe('Updated Corp');
    });
  });

  describe('deleteCompanyLogo', () => {
    it('calls DELETE /employers/company/logo', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({ data: {} });

      await companyProfileService.deleteCompanyLogo();

      expect(apiClient.delete).toHaveBeenCalledWith('/employers/company/logo', {
        signal: undefined,
      });
    });

    it('throws when DELETE /employers/company/logo fails', async () => {
      (apiClient.delete as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(companyProfileService.deleteCompanyLogo()).rejects.toThrow();
    });
  });

  describe('getPublicCompanyProfile', () => {
    it('calls GET /companies/{id} for GUID identifiers', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          id: companyId,
          name: 'Test Corp',
          logoUrl: null,
          description: 'Desc',
          industry: null,
          companySize: null,
          website: null,
          location: null,
          linkedIn: null,
          twitter: null,
          facebook: null,
          activeJobsCount: 1,
          publishedJobs: [
            {
              id: 'job-1',
              title: 'Software Engineer',
              location: 'Remote',
              city: null,
              country: null,
              employmentType: 'FullTime',
              workArrangement: 'Remote',
              experienceLevel: 'Senior',
              vacancies: 1,
              expireAt: '2027-01-01T00:00:00.000Z',
              publishedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      });

      const result = await companyProfileService.getPublicCompanyProfile(companyId);
      expect(apiClient.get).toHaveBeenCalledWith(`/companies/${companyId}`, {
        signal: undefined,
      });
      expect(result.name).toBe('Test Corp');
      expect(result.activeJobsCount).toBe(1);
      expect(result.publishedJobs[0].title).toBe('Software Engineer');
    });

    it('defaults reviewSummary to an all-zero summary when the backend field is absent', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          id: companyId,
          name: 'Test Corp',
          activeJobsCount: 0,
          publishedJobs: [],
        },
      });

      const result = await companyProfileService.getPublicCompanyProfile(companyId);

      expect(result.reviewSummary).toEqual({
        totalCount: 0,
        positiveCount: 0,
        negativeCount: 0,
        positivePercent: 0,
        recruitmentProcess: { average: null, ratingCount: 0 },
        communication: { average: null, ratingCount: 0 },
        interviewExperience: { average: null, ratingCount: 0 },
        professionalism: { average: null, ratingCount: 0 },
      });
    });

    it('passes through reviewSummary when the backend provides it', async () => {
      const reviewSummary = {
        totalCount: 3,
        positiveCount: 2,
        negativeCount: 1,
        positivePercent: 66.7,
        recruitmentProcess: { average: 4.5, ratingCount: 2 },
        communication: { average: null, ratingCount: 0 },
        interviewExperience: { average: 5, ratingCount: 1 },
        professionalism: { average: 3, ratingCount: 3 },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          id: companyId,
          name: 'Test Corp',
          activeJobsCount: 0,
          publishedJobs: [],
          reviewSummary,
        },
      });

      const result = await companyProfileService.getPublicCompanyProfile(companyId);

      expect(result.reviewSummary).toEqual(reviewSummary);
    });

    it('resolves a name slug via company search, then loads the full profile by id', async () => {
      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            items: [
              { id: 'other-id', name: 'Unrelated Inc' },
              { id: companyId, name: 'Test Corp' },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            id: companyId,
            name: 'Test Corp',
            logoUrl: 'https://cdn/logo.png',
            description: 'Real description',
            industry: 'Technology & Software',
            companySize: '51-200',
            website: 'https://test.com',
            location: 'New York, NY',
            linkedIn: null,
            twitter: null,
            facebook: null,
            activeJobsCount: 2,
            publishedJobs: [],
          },
        });

      const result = await companyProfileService.getPublicCompanyProfile('test-corp');

      expect(apiClient.get).toHaveBeenNthCalledWith(1, '/companies', {
        params: { keyword: 'test corp', page: 1, pageSize: 10 },
        signal: undefined,
      });
      expect(apiClient.get).toHaveBeenNthCalledWith(2, `/companies/${companyId}`, {
        signal: undefined,
      });
      // Real profile fields — not a synthesized stub.
      expect(result.id).toBe(companyId);
      expect(result.logoUrl).toBe('https://cdn/logo.png');
      expect(result.description).toBe('Real description');
      expect(result.industry).toBe('Technology & Software');
    });

    it('throws not-found when no company matches the slug', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { items: [{ id: 'other-id', name: 'Unrelated Inc' }] },
      });

      await expect(
        companyProfileService.getPublicCompanyProfile('no-such-company')
      ).rejects.toThrow();
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });
});
