import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileHeader } from '../ProfileHeader';
import type { CandidateProfile } from '../../../types/applicant.types';

const baseProfile: CandidateProfile = {
  applicationId: 'app-1',
  jobId: 'job-1',
  talentUserId: 'talent-1',
  name: 'Jessica Alba',
  email: 'jessica@example.com',
  tagline: 'Lead Frontend Architect',
  shortBio: null,
  location: 'San Francisco, CA',
  linkedInUrl: 'https://linkedin.com/in/jessica',
  additionalUrls: ['github.com/jessica'],
  totalYearsExperience: 8,
  expectedSalary: 150000,
  skillPropositions: [],
  technicalSkills: [],
  softSkills: [],
  toolsAndPlatforms: [],
  profilePictureUrl: null,
  videoIntroUrl: null,
  resumeOriginalFileName: 'Jessica_CV.pdf',
  resumeKind: null,
  resumeUrl: 'https://storage.test/jessica_resume.pdf',
  applicationStatus: 'Interview',
  aiMatchScore: 86,
  coverLetter: null,
  appliedAt: '2026-09-01T10:00:00Z',
  workExperiences: [],
  educations: [],
};

describe('ProfileHeader', () => {
  it('renders name, status, and populated contact chips', () => {
    render(<ProfileHeader profile={baseProfile} />);

    expect(screen.getByText('Jessica Alba')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'AI match score 86 out of 100' })).toBeInTheDocument();
    expect(screen.getByText('Lead Frontend Architect')).toBeInTheDocument();
    expect(screen.getByText('jessica@example.com')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText(/Applied Sep 1, 2026/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
  });

  it('shows Not specified for missing location and hides blank contact details', () => {
    render(
      <ProfileHeader
        profile={{
          ...baseProfile,
          email: '  ',
          location: null,
          linkedInUrl: null,
          additionalUrls: ['', '   ', 'github.com/jessica'],
          tagline: ' ',
        }}
      />
    );

    expect(screen.queryByText('jessica@example.com')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy email/i })).not.toBeInTheDocument();
    expect(screen.getByText('Not specified')).toBeInTheDocument();
    expect(screen.queryByText('Lead Frontend Architect')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /linkedin/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /github/i })).toHaveLength(1);
  });

  it('renders the unavailable score state without a score value', () => {
    render(<ProfileHeader profile={{ ...baseProfile, aiMatchScore: null }} />);

    const scoreFigure = screen.getByRole('img', { name: 'AI match score not available' });
    expect(scoreFigure).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });
});
