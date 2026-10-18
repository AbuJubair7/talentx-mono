import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmployerJobDetailView } from '../EmployerJobDetailView';
import { useMyJob } from '../../hooks/useMyJob';
import { useResubmitJob } from '../../hooks/useResubmitJob';

jest.mock('../../hooks/useMyJob');
jest.mock('../../hooks/useResubmitJob');

const mockReplace = jest.fn();
let mockTabParam: string | null = null;
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
    prefetch: jest.fn(),
  }),
  usePathname: () => '/job/job-listing/job-abc-123',
  useSearchParams: () => ({
    get: (key: string) => (key === 'tab' ? mockTabParam : null),
  }),
}));

// Heavy children with their own data needs; this test is about the moderation affordances.
jest.mock('../TalentMatchPanel', () => ({
  TalentMatchPanel: () => <div data-testid="talent-match-panel" />,
}));
jest.mock('@/modules/employer-applicants', () => ({
  ApplicantListView: () => <div data-testid="applicant-list" />,
}));
jest.mock('@/modules/employer-interviews', () => ({
  EmployerInterviewListView: () => <div data-testid="interview-list" />,
}));
// Mocked outright rather than with requireActual: pulling in the real barrel drags the whole
// job-listing module graph along, and its circular imports blow up under jest hoisting.
jest.mock('@/modules/job-listing', () => ({
  JobDetail: () => <div data-testid="job-detail" />,
  formatEmploymentType: (value: string) => value,
  formatLocation: (value: string | null | undefined) => value ?? null,
}));

const mockedUseMyJob = useMyJob as jest.MockedFunction<typeof useMyJob>;
const mockedUseResubmitJob = useResubmitJob as jest.MockedFunction<typeof useResubmitJob>;

const jobId = 'job-abc-123';

function buildJob(overrides: Record<string, unknown> = {}) {
  return {
    id: jobId,
    title: 'Senior Backend Engineer',
    companyName: 'Acme Corp',
    description: 'Build APIs.',
    location: 'Dhaka',
    employmentType: 'FullTime',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'Hybrid',
    requiredSkills: ['C#'],
    vacancies: 2,
    status: 'Published',
    createdAt: '2026-09-01T00:00:00Z',
    expireAt: '2026-12-31',
    ...overrides,
  };
}

function mockJob(overrides: Record<string, unknown> = {}) {
  mockedUseMyJob.mockReturnValue({
    data: buildJob(overrides),
    isPending: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof useMyJob>);
}

const deactivatedFields = {
  status: 'Deactivated',
  deactivationReasonLabel: 'Misleading or invalid information',
  deactivationDetails: "The salary in the title doesn't match the posting.",
  deactivatedAt: '2026-09-10T08:00:00Z',
};

describe('EmployerJobDetailView', () => {
  let mutateAsync: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    mockTabParam = null;
    mutateAsync = jest.fn().mockResolvedValue(undefined);
    mockedUseResubmitJob.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useResubmitJob>);
  });

  it('shows no moderation banner for a published job', () => {
    mockJob();

    render(<EmployerJobDetailView jobId={jobId} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Edit Job/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Resubmit for review/i })).not.toBeInTheDocument();
  });

  it('renders status badge in breadcrumb alongside the job title', () => {
    mockJob({ status: 'Published' });

    render(<EmployerJobDetailView jobId={jobId} />);

    expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders toolbar actions across non-job-details tabs', () => {
    mockJob();

    render(<EmployerJobDetailView jobId={jobId} initialTab="applicants" />);

    expect(screen.getByRole('link', { name: /Edit Job/i })).toBeInTheDocument();
    expect(screen.getByTestId('talent-match-panel')).toBeInTheDocument();
    expect(screen.getByTestId('applicant-list')).toBeInTheDocument();
  });

  it('provides an accessible heading matching the job title on non-details tab', () => {
    mockJob();

    render(<EmployerJobDetailView jobId={jobId} initialTab="applicants" />);

    const accessibleHeading = screen.getByRole('heading', { level: 1 });
    expect(accessibleHeading).toHaveTextContent('Senior Backend Engineer');
    expect(accessibleHeading).toHaveClass('sr-only');
  });

  it('explains a deactivation and points the employer at the fix', () => {
    mockJob(deactivatedFields);

    render(<EmployerJobDetailView jobId={jobId} />);

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('An admin deactivated this job');
    expect(banner).toHaveTextContent('Misleading or invalid information');
    expect(banner).toHaveTextContent("The salary in the title doesn't match the posting.");

    // The edit link is relabelled, because editing is now a fix, not a tweak.
    const editLink = screen.getByRole('link', { name: /Fix & Resubmit/i });
    expect(editLink).toHaveAttribute('href', `/job/${jobId}/edit`);
    expect(screen.queryByRole('link', { name: /Edit Job/i })).not.toBeInTheDocument();
  });

  it('resubmits without editing, for a fix that was already saved', async () => {
    mockJob(deactivatedFields);

    render(<EmployerJobDetailView jobId={jobId} />);

    await userEvent.click(screen.getByRole('button', { name: /Resubmit for review/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(jobId));
  });

  it('stays on the page when resubmitting fails, so the toast can explain why', async () => {
    mockJob(deactivatedFields);
    mutateAsync.mockRejectedValueOnce(new Error('Invalid or missing fields: Requirements'));

    render(<EmployerJobDetailView jobId={jobId} />);

    await userEvent.click(screen.getByRole('button', { name: /Resubmit for review/i }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /Resubmit for review/i })).toBeInTheDocument();
  });

  it('removes every edit affordance while an admin is reviewing the job', () => {
    mockJob({ ...deactivatedFields, status: 'PendingReview' });

    render(<EmployerJobDetailView jobId={jobId} />);

    expect(screen.getByRole('status')).toHaveTextContent('Under admin review');
    expect(screen.queryByRole('link', { name: /Edit Job/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Fix & Resubmit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Resubmit for review/i })).not.toBeInTheDocument();
  });

  describe('AI Talent Matching Panel Visibility', () => {
    it.each(['Published', 'Expired'] as const)(
      'shows the matching panel for a %s job',
      (status) => {
        mockJob({ status });

        render(<EmployerJobDetailView jobId={jobId} />);

        expect(screen.getByTestId('talent-match-panel')).toBeInTheDocument();
      }
    );

    it.each(['Draft', 'Closed', 'Deactivated', 'PendingReview'] as const)(
      'hides the matching panel for a %s job',
      (status) => {
        mockJob({ status });

        render(<EmployerJobDetailView jobId={jobId} />);

        expect(screen.queryByTestId('talent-match-panel')).not.toBeInTheDocument();
      }
    );
  });

  describe('Detail Tabs Ordering, Labels, and Deep-Linking', () => {
    beforeEach(() => {
      mockJob();
    });

    it('renders 3 detail tabs in exact order with exact labels and icons', () => {
      render(<EmployerJobDetailView jobId={jobId} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
      expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
        'Job Details',
        'Applicants',
        'Interviews',
      ]);
      const tabTexts = tabs.map((tab) => tab.textContent ?? '');
      expect(tabTexts).not.toContain('Applicants Management');
      expect(tabTexts).not.toContain('Job Specification');
      expect(screen.queryByText('Applicants Management')).not.toBeInTheDocument();
      expect(screen.queryByText('Job Specification')).not.toBeInTheDocument();
      tabs.forEach((tab) => {
        expect(tab.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('defaults to Job Details tab as active and renders JobDetail component', () => {
      render(<EmployerJobDetailView jobId={jobId} />);

      expect(screen.getByRole('tab', { name: /Job Details/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tab', { name: /Applicants/i })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('tab', { name: /Interviews/i })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByTestId('job-detail')).toBeInTheDocument();
      expect(screen.queryByTestId('applicant-list')).not.toBeInTheDocument();
      expect(screen.queryByTestId('interview-list')).not.toBeInTheDocument();
    });

    it('switches to Applicants tab on click and updates URL query param', async () => {
      render(<EmployerJobDetailView jobId={jobId} />);

      await userEvent.click(screen.getByRole('tab', { name: /Applicants/i }));

      expect(screen.getByTestId('applicant-list')).toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith('/job/job-listing/job-abc-123?tab=applicants', { scroll: false });
    });

    it('switches to Interviews tab on click and updates URL query param', async () => {
      render(<EmployerJobDetailView jobId={jobId} />);

      await userEvent.click(screen.getByRole('tab', { name: /Interviews/i }));

      expect(screen.getByTestId('interview-list')).toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith('/job/job-listing/job-abc-123?tab=interviews', { scroll: false });
    });

    it('clears tab query param when returning to Job Details tab', async () => {
      render(<EmployerJobDetailView jobId={jobId} initialTab="applicants" />);

      await userEvent.click(screen.getByRole('tab', { name: /Job Details/i }));

      expect(screen.getByTestId('job-detail')).toBeInTheDocument();
      expect(mockReplace).toHaveBeenCalledWith('/job/job-listing/job-abc-123', { scroll: false });
    });

    it('honors initialTab prop when provided', () => {
      render(<EmployerJobDetailView jobId={jobId} initialTab="interviews" />);

      expect(screen.getByRole('tab', { name: /Interviews/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('interview-list')).toBeInTheDocument();
    });

    it('honors ?tab= URL search parameter when present', () => {
      mockTabParam = 'applicants';

      render(<EmployerJobDetailView jobId={jobId} />);

      expect(screen.getByRole('tab', { name: /Applicants/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('applicant-list')).toBeInTheDocument();
    });
  });
});
