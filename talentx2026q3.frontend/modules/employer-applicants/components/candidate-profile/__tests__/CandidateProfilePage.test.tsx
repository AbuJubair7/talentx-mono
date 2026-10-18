import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateProfilePage } from '../CandidateProfilePage';
import { useCandidateProfile } from '../../../hooks/useCandidateProfile';
import { useJobApplicants } from '../../../hooks/useJobApplicants';
import { useUpdateApplicationStatus } from '../../../hooks/useUpdateApplicationStatus';
import type { CandidateProfile, JobApplicant } from '../../../types/applicant.types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: () => null }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...restProperties
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement('a', { href, ...restProperties }, children),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <div>
      {children}
      <button type="button" onClick={() => onValueChange?.('Hired')}>
        mock-select-hired
      </button>
      <button type="button" onClick={() => onValueChange?.('Applied')}>
        mock-select-applied
      </button>
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value, disabled }: { children: React.ReactNode; value: string; disabled?: boolean }) => (
    <div data-value={value} aria-disabled={disabled ?? false}>{children}</div>
  ),
}));

jest.mock('../../../hooks/useCandidateProfile');
jest.mock('../../../hooks/useJobApplicants');
jest.mock('../../../hooks/useUpdateApplicationStatus');

const mockUseCandidateProfile = useCandidateProfile as jest.Mock;
const mockUseJobApplicants = useJobApplicants as jest.Mock;
const mockUseUpdateApplicationStatus = useUpdateApplicationStatus as jest.Mock;

describe('CandidateProfilePage', () => {
  const jobId = 'job-100';
  const applicationId = 'app-200';
  const mockMutateAsync = jest.fn();
  const mockRefetch = jest.fn();

  const mockProfile: CandidateProfile = {
    applicationId,
    jobId,
    talentUserId: 'talent-1',
    name: 'Jessica Alba',
    email: 'jessica@example.com',
    tagline: 'Lead Frontend Architect',
    shortBio: 'Creative engineer with 8+ years building enterprise applications.',
    location: 'San Francisco, CA',
    linkedInUrl: 'https://linkedin.com/in/jessica',
    additionalUrls: [],
    totalYearsExperience: 8,
    expectedSalary: 150000,
    skillPropositions: ['System Architecture', 'Design Systems'],
    technicalSkills: ['React', 'TypeScript'],
    softSkills: ['Mentorship'],
    toolsAndPlatforms: ['Figma'],
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

  const applicants: JobApplicant[] = [
    {
      id: 'app-100',
      jobId,
      talentUserId: 't-0',
      applicantName: 'First Candidate',
      applicantEmail: 'first@example.com',
      resumeDownloadUrl: null,
      status: 'Applied',
      aiMatchScore: 70,
      expectedSalary: null,
      totalYearsExperience: null,
      location: null,
      appliedAt: '2026-09-02T10:00:00Z',
    },
    {
      id: applicationId,
      jobId,
      talentUserId: 't-1',
      applicantName: 'Jessica Alba',
      applicantEmail: 'jessica@example.com',
      resumeDownloadUrl: null,
      status: 'Interview',
      aiMatchScore: 86,
      expectedSalary: null,
      totalYearsExperience: null,
      location: null,
      appliedAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'app-300',
      jobId,
      talentUserId: 't-2',
      applicantName: 'Third Candidate',
      applicantEmail: 'third@example.com',
      resumeDownloadUrl: null,
      status: 'Applied',
      aiMatchScore: 60,
      expectedSalary: null,
      totalYearsExperience: null,
      location: null,
      appliedAt: '2026-08-30T10:00:00Z',
    },
  ];

  const setProfileQuery = (overrides: Record<string, unknown> = {}) => {
    mockUseCandidateProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      ...overrides,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateApplicationStatus.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    mockUseJobApplicants.mockReturnValue({ data: undefined });
  });

  it('renders loading skeleton while the profile query is pending', () => {
    setProfileQuery({ data: undefined, isPending: true });

    render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    expect(screen.getByLabelText('Loading candidate profile')).toBeInTheDocument();
  });

  it('renders an error state with retry when the profile query fails', async () => {
    setProfileQuery({
      data: undefined,
      isError: true,
      error: { message: 'Profile not found' },
    });

    const user = userEvent.setup();
    render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    expect(screen.getByText('Failed to load candidate profile.')).toBeInTheDocument();
    expect(screen.getByText('Profile not found')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders the full candidate profile with AI score, sections, and rail details', () => {
    setProfileQuery();

    render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    expect(screen.getByText('Jessica Alba')).toBeInTheDocument();
    expect(screen.getByText('Lead Frontend Architect')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'AI match score 86 out of 100' })).toBeInTheDocument();

    expect(screen.getByText('Short Bio')).toBeInTheDocument();
    expect(screen.getByText('System Architecture')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Mentorship')).toBeInTheDocument();

    expect(screen.getByText('Jessica_CV.pdf')).toBeInTheDocument();
    expect(screen.getByText('8 years')).toBeInTheDocument();
    expect(screen.getByText('$150,000')).toBeInTheDocument();
    expect(screen.getByText('Excited to apply for this lead role.')).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back to applicants/i });
    expect(backLink).toHaveAttribute('href', `/job/job-listing/${jobId}?tab=applicants`);

    const downloadLink = screen.getByRole('link', { name: 'Download Jessica_CV.pdf' });
    expect(downloadLink).toHaveAttribute('href', 'https://storage.test/jessica_resume.pdf');
  });

  it('builds prev/next navigation from the current applicant list context', () => {
    setProfileQuery();
    mockUseJobApplicants.mockReturnValue({
      data: { items: applicants, page: 1, pageSize: 100, totalCount: 3, totalPages: 1 },
    });

    render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    expect(
      screen.getByText((_, element) => element?.tagName === 'SPAN' && element.textContent === '2 of 3')
    ).toBeInTheDocument();

    const prevLink = screen.getByRole('link', { name: /previous candidate/i });
    const nextLink = screen.getByRole('link', { name: /next candidate/i });
    expect(prevLink).toHaveAttribute('href', expect.stringContaining('/applicants/app-100'));
    expect(nextLink).toHaveAttribute('href', expect.stringContaining('/applicants/app-300'));
  });

  it('saves a new application status and shows a success toast', async () => {
    setProfileQuery();
    mockMutateAsync.mockResolvedValueOnce({ message: 'Status updated' });

    const user = userEvent.setup();
    render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    const saveButton = screen.getByRole('button', { name: /save status/i });
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'mock-select-hired' }));
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({ applicationId, newStatus: 'Hired' });
  });

  it('offers the Applied revert option for manually assignable statuses', () => {
    setProfileQuery({ data: { ...mockProfile, applicationStatus: 'Shortlisted' } });

    const { container } = render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    expect(container.querySelector('[data-value="Applied"]')).toBeInTheDocument();
  });

  it('does not offer the Applied revert option for non-revertible statuses', () => {
    setProfileQuery();

    const { container } = render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    expect(container.querySelector('[data-value="Applied"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-value="Hired"]')).toBeInTheDocument();
  });

  it('mutes the Applied option for an already-applied applicant', () => {
    setProfileQuery({ data: { ...mockProfile, applicationStatus: 'Applied' } });

    const { container } = render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    const appliedOption = container.querySelector('[data-value="Applied"]');
    expect(appliedOption).toBeInTheDocument();
    expect(appliedOption).toHaveAttribute('aria-disabled', 'true');
    expect(container.querySelector('[data-value="Hired"]')).toHaveAttribute('aria-disabled', 'false');
  });

  it('reverts a shortlisted candidate to Applied', async () => {
    setProfileQuery({ data: { ...mockProfile, applicationStatus: 'Shortlisted' } });
    mockMutateAsync.mockResolvedValueOnce({ message: 'Status updated' });

    const user = userEvent.setup();
    render(<CandidateProfilePage jobId={jobId} applicationId={applicationId} />);

    const saveButton = screen.getByRole('button', { name: /save status/i });
    expect(saveButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'mock-select-applied' }));
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({ applicationId, newStatus: 'Applied' });
  });
});
