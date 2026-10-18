import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';
import { applicantService } from '../../services/applicant.service';
import { useCandidateProfile } from '../useCandidateProfile';
import type { CandidateProfile } from '../../types/applicant.types';

jest.mock('../../services/applicant.service', () => ({
  applicantService: {
    getCandidateProfile: jest.fn(),
  },
}));

const mockedApplicantService = applicantService as jest.Mocked<typeof applicantService>;

describe('useCandidateProfile', () => {
  const applicationId = 'app-789';
  const mockProfile: CandidateProfile = {
    applicationId,
    jobId: 'job-123',
    talentUserId: 'talent-1',
    name: 'Jane Candidate',
    email: 'jane@example.com',
    tagline: 'Dev',
    shortBio: 'Bio',
    location: 'Dhaka',
    linkedInUrl: null,
    additionalUrls: [],
    totalYearsExperience: 5,
    expectedSalary: 100000,
    skillPropositions: [],
    technicalSkills: ['C#'],
    softSkills: [],
    toolsAndPlatforms: [],
    profilePictureUrl: null,
    videoIntroUrl: null,
    resumeOriginalFileName: 'Resume.pdf',
    resumeKind: null,
    resumeUrl: 'https://storage.test/resume.pdf',
    applicationStatus: 'Applied',
    aiMatchScore: null,
    coverLetter: null,
    appliedAt: '2026-09-01T00:00:00Z',
    workExperiences: [],
    educations: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches candidate profile when applicationId is provided', async () => {
    mockedApplicantService.getCandidateProfile.mockResolvedValueOnce(mockProfile);

    const wrapper = createQueryWrapper();

    const { result } = renderHook(() => useCandidateProfile(applicationId), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedApplicantService.getCandidateProfile).toHaveBeenCalledWith(
      applicationId,
      expect.any(AbortSignal)
    );
    expect(result.current.data).toEqual(mockProfile);
  });

  it('disables query when applicationId is null', () => {
    const wrapper = createQueryWrapper();

    const { result } = renderHook(() => useCandidateProfile(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedApplicantService.getCandidateProfile).not.toHaveBeenCalled();
  });
});
