import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileMainSections } from '../ProfileMainSections';
import type { CandidateProfile, CandidateProjectItem } from '../../../types/applicant.types';

const baseProfile: CandidateProfile = {
  applicationId: 'app-1',
  jobId: 'job-1',
  talentUserId: 'talent-1',
  name: 'Jessica Alba',
  email: 'jessica@example.com',
  tagline: 'Lead Frontend Architect',
  shortBio: 'Creative engineer with 8+ years building enterprise applications.',
  location: 'San Francisco, CA',
  linkedInUrl: null,
  additionalUrls: [],
  totalYearsExperience: 8,
  expectedSalary: 150000,
  skillPropositions: ['System Architecture'],
  technicalSkills: ['React'],
  softSkills: ['Mentorship'],
  toolsAndPlatforms: ['Figma'],
  profilePictureUrl: null,
  videoIntroUrl: null,
  resumeOriginalFileName: 'Jessica_CV.pdf',
  resumeKind: null,
  resumeUrl: 'https://storage.test/jessica_resume.pdf',
  applicationStatus: 'Interview',
  aiMatchScore: 86,
  coverLetter: null,
  appliedAt: '2026-09-01T10:00:00Z',
  workExperiences: [
    {
      id: 'exp-1',
      companyName: 'Acme Corp',
      jobTitle: 'Senior UI Engineer',
      startDate: '2021-01-01',
      endDate: null,
      isCurrent: true,
    },
  ],
  educations: [
    {
      id: 'edu-1',
      institution: 'Stanford University',
      degree: 'B.S. Software Engineering',
      startDate: '2016-09-01',
      endDate: '2020-06-01',
    },
  ],
};

describe('ProfileMainSections', () => {
  it('renders about, skills, experience timeline, and education', () => {
    render(<ProfileMainSections profile={baseProfile} />);

    expect(screen.getByText('Short Bio')).toBeInTheDocument();
    expect(screen.getByText(baseProfile.shortBio!)).not.toHaveClass('max-w-[68ch]');
    expect(screen.getByText('System Architecture')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Tools & Platforms')).toBeInTheDocument();
    expect(screen.getByText('Soft Skills')).toBeInTheDocument();
    expect(screen.getByText('Senior UI Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Current Role')).toBeInTheDocument();
    expect(screen.getByText('B.S. Software Engineering')).toBeInTheDocument();
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
  });

  it('renders fallback copy when optional profile data is missing', () => {
    render(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          shortBio: null,
          skillPropositions: [],
          technicalSkills: [],
          softSkills: [],
          toolsAndPlatforms: [],
          workExperiences: [],
          educations: [],
        }}
      />
    );

    expect(screen.getByText('Short Bio')).toBeInTheDocument();
    expect(screen.getByText('No short bio has been provided by this candidate.')).toBeInTheDocument();
    expect(screen.getByText('Core Competencies & Key Highlights')).toBeInTheDocument();
    expect(screen.getByText('No competencies or highlights have been provided.')).toBeInTheDocument();
    expect(screen.getByText('No skills have been added to this profile.')).toBeInTheDocument();
    expect(screen.getByText('No work experience has been provided by this candidate.')).toBeInTheDocument();
    expect(screen.getByText('No education information has been provided.')).toBeInTheDocument();
    expect(screen.getByText('No projects have been provided by this candidate.')).toBeInTheDocument();
  });

  it('treats whitespace-only text and blank list items as missing data', () => {
    render(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          shortBio: '   ',
          skillPropositions: ['  ', ''],
          technicalSkills: [],
          softSkills: [],
          toolsAndPlatforms: [],
        }}
      />
    );

    expect(screen.getByText('No short bio has been provided by this candidate.')).toBeInTheDocument();
    expect(screen.getByText('No competencies or highlights have been provided.')).toBeInTheDocument();
    expect(screen.getByText('No skills have been added to this profile.')).toBeInTheDocument();
  });

  it('renders education dates only from existing values', () => {
    const educationWith = (startDate: string | null, endDate: string | null) => [
      { id: 'edu-date', institution: 'MIT', degree: 'M.S. Software Engineering', startDate, endDate },
    ];
    const emptyWork = { ...baseProfile, workExperiences: [] };

    const view = render(
      <ProfileMainSections
        profile={{ ...emptyWork, educations: educationWith('2016-09-01', '2020-06-01') }}
      />
    );
    expect(screen.getByText('Sep 2016 – Jun 2020')).toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{ ...emptyWork, educations: educationWith(null, '2015-05-01') }}
      />
    );
    expect(screen.getByText('May 2015')).toBeInTheDocument();
    expect(screen.queryByText(/N\/A –/)).not.toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{ ...emptyWork, educations: educationWith('2016-09-01', null) }}
      />
    );
    expect(screen.getByText('Sep 2016')).toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{ ...emptyWork, educations: educationWith(null, null) }}
      />
    );
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  it('renders work experience dates only from existing values', () => {
    const experienceWith = (overrides: { startDate: string | null; endDate: string | null; isCurrent: boolean }) => [
      {
        id: 'exp-date',
        companyName: 'Acme Corp',
        jobTitle: 'Senior UI Engineer',
        ...overrides,
      },
    ];
    const emptyEducation = { ...baseProfile, educations: [] };

    const view = render(
      <ProfileMainSections
        profile={{
          ...emptyEducation,
          workExperiences: experienceWith({ startDate: '2021-01-01', endDate: null, isCurrent: true }),
        }}
      />
    );
    expect(screen.getByText('Jan 2021 – Present')).toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{
          ...emptyEducation,
          workExperiences: experienceWith({ startDate: null, endDate: '2019-03-01', isCurrent: false }),
        }}
      />
    );
    expect(screen.getByText('Mar 2019')).toBeInTheDocument();
    expect(screen.queryByText(/N\/A –/)).not.toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{
          ...emptyEducation,
          workExperiences: experienceWith({ startDate: null, endDate: null, isCurrent: true }),
        }}
      />
    );
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{
          ...emptyEducation,
          workExperiences: experienceWith({ startDate: null, endDate: null, isCurrent: false }),
        }}
      />
    );
    expect(screen.queryByText('N/A')).not.toBeInTheDocument();
  });

  it('renders projects section with project details, tags, and link', () => {
    const mockProjects: CandidateProjectItem[] = [
      {
        id: 'proj-1',
        projectName: 'Distributed Cache Engine',
        role: 'Lead Architect',
        projectType: 'Open Source',
        startDate: '2023-01-01',
        endDate: '2023-11-01',
        isOngoing: false,
        description: 'Built a high-throughput in-memory cache system.',
        technologiesUsed: ['Rust', 'Tokio', 'Redis'],
        projectUrl: 'https://github.com/example/cache-engine',
      },
    ];

    render(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          projects: mockProjects,
        }}
      />
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Distributed Cache Engine')).toBeInTheDocument();
    expect(screen.getByText('Lead Architect · Open Source')).toBeInTheDocument();
    expect(screen.getByText('Jan 2023 – Nov 2023')).toBeInTheDocument();
    expect(screen.getByText('Built a high-throughput in-memory cache system.')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
    expect(screen.getByText('Tokio')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /view project/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://github.com/example/cache-engine');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByText('Ongoing')).not.toBeInTheDocument();
  });

  it('renders ongoing project with ongoing badge, present date, and handles missing link', () => {
    const ongoingProjects: CandidateProjectItem[] = [
      {
        id: 'proj-ongoing',
        projectName: 'AI Copilot Platform',
        role: 'Staff Engineer',
        projectType: 'Professional',
        startDate: '2024-03-01',
        endDate: null,
        isOngoing: true,
        description: 'Building next-gen developer tools.',
        technologiesUsed: ['TypeScript', 'Next.js'],
        projectUrl: null,
      },
    ];

    render(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          projects: ongoingProjects,
        }}
      />
    );

    expect(screen.getByText('AI Copilot Platform')).toBeInTheDocument();
    expect(screen.getByText('Staff Engineer · Professional')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Mar 2024 – Present')).toBeInTheDocument();
    expect(screen.getByText('Building next-gen developer tools.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /view project/i })).not.toBeInTheDocument();
  });

  it('renders empty state when projects is empty array or undefined', () => {
    const view = render(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          projects: [],
        }}
      />
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('No projects have been provided by this candidate.')).toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          projects: undefined,
        }}
      />
    );

    expect(screen.getByText('No projects have been provided by this candidate.')).toBeInTheDocument();
  });

  it('renders project dates only from existing values', () => {
    const projectWith = (startDate: string, endDate: string | null, isOngoing: boolean): CandidateProjectItem[] => [
      {
        id: 'proj-date',
        projectName: 'Telemetry Service',
        role: 'Backend Engineer',
        projectType: 'Professional',
        startDate,
        endDate,
        isOngoing,
        description: 'Service telemetry.',
        technologiesUsed: ['Go'],
        projectUrl: null,
      },
    ];

    const view = render(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          projects: projectWith('2022-01-01', '2022-12-01', false),
        }}
      />
    );
    expect(screen.getByText('Jan 2022 – Dec 2022')).toBeInTheDocument();

    view.rerender(
      <ProfileMainSections
        profile={{
          ...baseProfile,
          projects: projectWith('2022-01-01', null, false),
        }}
      />
    );
    expect(screen.getByText('Jan 2022')).toBeInTheDocument();
  });
});
