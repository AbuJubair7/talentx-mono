import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileSideRail } from '../ProfileSideRail';
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
  linkedInUrl: null,
  additionalUrls: [],
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
  coverLetter: 'Excited to apply for this lead role.',
  appliedAt: '2026-09-01T10:00:00Z',
  workExperiences: [],
  educations: [],
};

describe('ProfileSideRail', () => {
  it('renders snapshot, downloadable resume, and cover letter', () => {
    render(<ProfileSideRail profile={baseProfile} />);

    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'AI match score' })).toHaveAttribute(
      'aria-valuenow',
      '86'
    );
    expect(screen.getByText('8 years')).toBeInTheDocument();
    expect(screen.getByText('$150,000')).toBeInTheDocument();
    expect(screen.getByText('Jessica_CV.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF · Available to download')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download/i })).toHaveAttribute(
      'href',
      'https://storage.test/jessica_resume.pdf'
    );
    expect(screen.getByText('Excited to apply for this lead role.')).toBeInTheDocument();
  });

  it('shows the DOCX type for Word resumes with its own chip', () => {
    render(
      <ProfileSideRail
        profile={{ ...baseProfile, resumeOriginalFileName: 'Jessica_CV.docx' }}
      />
    );

    expect(screen.getByText('Jessica_CV.docx')).toBeInTheDocument();
    expect(screen.getByText('DOCX · Available to download')).toBeInTheDocument();
    expect(screen.getByText('DOCX')).toBeInTheDocument();
    expect(screen.queryByText(/^PDF$/)).not.toBeInTheDocument();
  });

  it('trusts the backend resumeKind even when the shown name has no extension', () => {
    const extensionlessDisplayName =
      'Md_Mehedi_Hasan_Rafi_Senior_Software_Engineer_Full_Stack_DotNet_NextJS_React_TypeScript_JavaScript_P';
    render(
      <ProfileSideRail
        profile={{
          ...baseProfile,
          resumeOriginalFileName: extensionlessDisplayName,
          resumeKind: 'DOCX',
        }}
      />
    );

    expect(screen.getByText(extensionlessDisplayName)).toBeInTheDocument();
    expect(screen.getByText('DOCX · Available to download')).toBeInTheDocument();
    expect(screen.getByText('DOCX')).toBeInTheDocument();
    expect(screen.queryByText(/^PDF$/)).not.toBeInTheDocument();
  });

  it('falls back gracefully when score and resume are missing', () => {
    render(
      <ProfileSideRail
        profile={{ ...baseProfile, aiMatchScore: null, resumeUrl: null, resumeOriginalFileName: null }}
      />
    );

    expect(screen.getByText('Not available')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('No resume has been uploaded.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Resume.pdf')).not.toBeInTheDocument();
  });

  it('shows Not specified for missing snapshot values and keeps their rows', () => {
    render(
      <ProfileSideRail
        profile={{
          ...baseProfile,
          totalYearsExperience: null,
          expectedSalary: null,
          appliedAt: '',
        }}
      />
    );

    expect(screen.getAllByText('Not specified')).toHaveLength(3);
    expect(screen.getByText('Total experience')).toBeInTheDocument();
    expect(screen.getByText('Expected salary')).toBeInTheDocument();
    expect(screen.getByText('Applied date')).toBeInTheDocument();
  });

  it('hides optional video and cover letter sections when their data is empty', () => {
    render(
      <ProfileSideRail
        profile={{ ...baseProfile, videoIntroUrl: '   ', coverLetter: '' }}
      />
    );

    expect(screen.queryByText('Video Introduction')).not.toBeInTheDocument();
    expect(screen.queryByText('Cover Letter')).not.toBeInTheDocument();
  });
});
