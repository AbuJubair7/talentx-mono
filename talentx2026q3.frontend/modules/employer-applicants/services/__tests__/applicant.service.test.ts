import { apiClient } from '@/lib/api/axios';
import { applicantService } from '../applicant.service';
import type {
  CandidateProfile,
  JobApplicant,
  PaginatedApplicantList,
} from '../../types/applicant.types';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedGet = jest.mocked(apiClient.get);
const mockedPatch = jest.mocked(apiClient.patch);

afterEach(() => {
  jest.clearAllMocks();
});

describe('applicantService', () => {
  const jobId = 'job-123';
  const appId = 'app-456';

  const mockApplicant: JobApplicant = {
    id: appId,
    jobId,
    talentUserId: 'talent-789',
    applicantName: 'Sarah Connor',
    applicantEmail: 'sarah@example.com',
    resumeDownloadUrl: 'https://storage.example/cv.pdf',
    status: 'Applied',
    aiMatchScore: 88,
    expectedSalary: 95000,
    totalYearsExperience: 4,
    location: 'Austin, TX',
    appliedAt: '2026-09-01T10:00:00Z',
  };

  const mockPaginatedList: PaginatedApplicantList<JobApplicant> = {
    items: [mockApplicant],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  };

  describe('getJobApplicants', () => {
    it('fetches paginated applicant list successfully', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedList });

      const result = await applicantService.getJobApplicants(jobId, {
        page: 1,
        pageSize: 10,
        search: 'Sarah',
        status: 'Applied',
      });

      expect(mockedGet).toHaveBeenCalledWith(`/jobs/${jobId}/applications`, {
        params: { page: 1, pageSize: 10, search: 'Sarah', status: 'Applied' },
        signal: undefined,
      });
      expect(result).toEqual(mockPaginatedList);
    });

    it('normalizes raw array response into paginated structure when backend returns array', async () => {
      mockedGet.mockResolvedValueOnce({ data: [mockApplicant] });

      const result = await applicantService.getJobApplicants(jobId);

      expect(result).toEqual({
        items: [mockApplicant],
        page: 1,
        pageSize: 1,
        totalCount: 1,
        totalPages: 1,
      });
    });
  });

  describe('updateApplicationStatus', () => {
    it('calls patch status endpoint with new status', async () => {
      mockedPatch.mockResolvedValueOnce({ data: undefined });

      await applicantService.updateApplicationStatus(appId, 'Interview');

      expect(mockedPatch).toHaveBeenCalledWith(`/job-applications/${appId}/status`, {
        newStatus: 'Interview',
      });
    });
  });

  describe('getCandidateProfile', () => {
    it('fetches candidate profile by application ID', async () => {
      const mockProfile: CandidateProfile = {
        applicationId: appId,
        jobId,
        talentUserId: 'talent-789',
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        tagline: 'Cybersecurity Specialist',
        shortBio: 'Experienced analyst',
        location: 'Austin, TX',
        linkedInUrl: 'https://linkedin.com/in/sarah',
        additionalUrls: ['https://github.com/sarah'],
        totalYearsExperience: 4,
        expectedSalary: 95000,
        skillPropositions: ['Threat hunting'],
        technicalSkills: ['Python', 'SIEM'],
        softSkills: ['Adaptability'],
        toolsAndPlatforms: ['Splunk'],
        profilePictureUrl: 'https://storage.example/pic.jpg',
        videoIntroUrl: null,
        resumeOriginalFileName: 'Sarah_Resume.pdf',
        resumeKind: null,
        resumeUrl: 'https://storage.example/cv.pdf',
        applicationStatus: 'Applied',
        aiMatchScore: 84,
        coverLetter: 'Ready for duty',
        appliedAt: '2026-09-01T10:00:00Z',
        workExperiences: [],
        educations: [],
      };

      mockedGet.mockResolvedValueOnce({ data: mockProfile });

      const result = await applicantService.getCandidateProfile(appId);

      expect(mockedGet).toHaveBeenCalledWith(`/job-applications/${appId}/candidate-profile`, {
        signal: undefined,
      });
      expect(result).toEqual(mockProfile);
    });
  });
});
