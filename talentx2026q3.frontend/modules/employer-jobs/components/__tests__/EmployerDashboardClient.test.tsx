import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';

import { EmployerDashboardClient } from '../EmployerDashboardClient';
import { employerJobsService } from '../../services/employer-jobs.service';
import type { EmployerDashboardDto } from '../../types/employer-job.types';

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    getDashboard: jest.fn(),
    closeJob: jest.fn(),
    deleteJob: jest.fn(),
    publishJob: jest.fn(),
    reopenJob: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DropdownMenuTrigger: ({
    children,
    ...restProperties
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement('div', restProperties, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => React.createElement('button', { onClick, className }, children),
  DropdownMenuLinkItem: ({
    children,
    href,
    'aria-disabled': ariaDisabled,
  }: {
    children: React.ReactNode;
    href?: string;
    'aria-disabled'?: boolean;
  }) => React.createElement('a', { href, 'aria-disabled': ariaDisabled }, children),
  DropdownMenuSeparator: () => React.createElement('hr', null),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) =>
    open ? React.createElement('div', { role: 'dialog' }, children) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', null, children),
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement('p', null, children),
  DialogClose: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));

jest.mock('@/modules/jobposting/hooks/useCurrentEmployer', () => ({
  useCurrentEmployer: jest.fn(() => ({
    data: { verificationStatus: 'Verified', rejectionReason: null },
  })),
}));

jest.mock('@/modules/jobposting/services/me.service', () => ({
  meService: {
    getCurrentEmployer: jest.fn(),
    reApply: jest.fn(),
  },
}));

jest.mock('@/modules/employer-verification', () => ({
  VerificationStatusBanner: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', null, children),
  VerificationStatusDialog: () => null,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => React.createElement('button', { onClick, disabled, className }, children),
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

const mockDashboardData: EmployerDashboardDto = {
  totalPostedJobs: 12,
  totalHires: 4,
  activeJobsCount: 8,
  draftJobsCount: 2,
  closedJobsCount: 3,
  expiredJobsCount: 1,
  deactivatedJobsCount: 0,
  pendingReviewJobsCount: 0,
  candidatePipeline: {
    appliedCount: 20,
    shortlistedCount: 8,
    invitedCount: 5,
    interviewCount: 3,
    rejectedCount: 4,
    hiredCount: 4,
  },
  recentJobs: [
    {
      id: 'job-senior-ai',
      title: 'Senior AI Engineer',
      status: 'Published',
      createdAt: '2026-09-01T10:00:00Z',
      expireAt: '2026-10-01T10:00:00Z',
      vacancies: 2,
      applicantCount: 15,
    },
    {
      id: 'job-staff-ml',
      title: 'Staff ML Infrastructure Engineer',
      status: 'Draft',
      createdAt: '2026-08-28T10:00:00Z',
      expireAt: '2026-09-28T10:00:00Z',
      vacancies: 1,
      applicantCount: 0,
    },
    {
      id: 'job-closed-lead',
      title: 'Lead Data Architect',
      status: 'Closed',
      createdAt: '2026-07-20T10:00:00Z',
      expireAt: '2030-07-20T10:00:00Z',
      vacancies: 1,
      applicantCount: 8,
    },
  ],
};

describe('EmployerDashboardClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton when isLoading is true', () => {
    mockedEmployerJobsService.getDashboard.mockReturnValue(new Promise(() => {}));

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    expect(screen.getByTestId('employer-dashboard-skeleton')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /loading employer dashboard/i })).toBeInTheDocument();
    expect(screen.queryByText('Total Posted Jobs')).not.toBeInTheDocument();
  });

  it('renders all 3 metric cards with corresponding numbers from mock data', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Total Posted Jobs')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Posted Jobs')).toBeInTheDocument();
    const totalPostedCard = screen.getByRole('link', { name: /view total posted jobs listings/i });
    expect(within(totalPostedCard).getByText('12')).toBeInTheDocument();

    expect(screen.getByText('Total Hires')).toBeInTheDocument();
    const totalHiresCard = screen.getByRole('link', { name: /view total hires listings/i });
    expect(within(totalHiresCard).getByText('4')).toBeInTheDocument();

    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    const activeJobsCard = screen.getByRole('link', { name: /view active listings/i });
    expect(within(activeJobsCard).getByText('8')).toBeInTheDocument();
  });

  it('renders metric cards as clickable links to My Jobs with respective status filters and cursor-pointer', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Total Posted Jobs')).toBeInTheDocument();
    });

    const totalPostedLink = screen.getByRole('link', { name: /view total posted jobs listings/i });
    expect(totalPostedLink).toHaveAttribute('href', '/job/job-listing?status=All');
    expect(totalPostedLink).toHaveClass('cursor-pointer');

    const totalHiresLink = screen.getByRole('link', { name: /view total hires listings/i });
    expect(totalHiresLink).toHaveAttribute('href', '/job/job-listing?status=All');
    expect(totalHiresLink).toHaveClass('cursor-pointer');

    const activeLink = screen.getByRole('link', { name: /view active listings/i });
    expect(activeLink).toHaveAttribute('href', '/job/job-listing?status=Active');
    expect(activeLink).toHaveClass('cursor-pointer');
  });

  it('renders recent jobs with titles, status badges, and applicant counts', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const seniorAiTitle = screen.getByText('Senior AI Engineer');
    expect(seniorAiTitle).toBeInTheDocument();
    expect(seniorAiTitle).toHaveClass('text-slate-900');

    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('15 applicants')).toBeInTheDocument();
    expect(screen.getByText('2 openings')).toBeInTheDocument();
    expect(screen.getAllByText(/Posted /i).length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Staff ML Infrastructure Engineer')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('0 applicants')).toBeInTheDocument();
    expect(screen.getAllByText('1 opening')[0]).toBeInTheDocument();
  });

  it('renders empty state when recentJobs is empty', async () => {
    const emptyRecentJobsDashboard: EmployerDashboardDto = {
      ...mockDashboardData,
      recentJobs: [],
    };

    mockedEmployerJobsService.getDashboard.mockResolvedValue(emptyRecentJobsDashboard);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('No jobs posted yet.')).toBeInTheDocument();
    });

    expect(screen.getByText('No jobs posted yet.')).toBeInTheDocument();
    const postAJobLinks = screen.getAllByRole('link', { name: /post a job/i });
    expect(postAJobLinks.length).toBeGreaterThanOrEqual(1);
    expect(postAJobLinks[0]).toHaveAttribute('href', '/job/jobpost');
  });

  it('shows a deactivated recent job as Deactivated, never as a publishable Draft', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue({
      ...mockDashboardData,
      deactivatedJobsCount: 1,
      recentJobs: [
        {
          id: 'job-taken-down',
          title: 'Taken Down Role',
          status: 'Deactivated',
          createdAt: '2026-09-01T10:00:00Z',
          expireAt: '2026-10-01T10:00:00Z',
          vacancies: 1,
          applicantCount: 0,
        },
      ],
    });

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Taken Down Role')).toBeInTheDocument();
    });

    expect(screen.getByText('Deactivated')).toBeInTheDocument();
    // The old fallback mapped it to Draft and offered Publish, which the backend rejects.
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
  });

  it('shows a job under review as "Under review" with no actions to take', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue({
      ...mockDashboardData,
      pendingReviewJobsCount: 1,
      recentJobs: [
        {
          id: 'job-in-review',
          title: 'Resubmitted Role',
          status: 'PendingReview',
          createdAt: '2026-09-01T10:00:00Z',
          expireAt: '2026-10-01T10:00:00Z',
          vacancies: 1,
          applicantCount: 0,
        },
      ],
    });

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Resubmitted Role')).toBeInTheDocument();
    });

    // "Under review" also appears as a donut legend row, so check the job's own badge.
    const activityRow = screen.getByText('Resubmitted Role').closest('article') as HTMLElement;
    expect(within(activityRow).getByText('Under review')).toBeInTheDocument();
    expect(screen.queryByText('Delete Job')).not.toBeInTheDocument();
  });

  it('links "View all" to /job/job-listing', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /view all/i })).toBeInTheDocument();
    });

    const viewAllJobsLink = screen.getByRole('link', { name: /view all/i });
    expect(viewAllJobsLink).toHaveAttribute('href', '/job/job-listing');
  });

  it('triggers confirmation dialog on Close Job action and executes mutation', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);
    mockedEmployerJobsService.closeJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const closeJobButtons = screen.getAllByRole('button', { name: 'Close Job' });
    await user.click(closeJobButtons[0]);

    const dialogElement = screen.getByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(
      within(dialogElement).getByText(
        'Closing "Senior AI Engineer" will remove it from public listings. Are you sure?'
      )
    ).toBeInTheDocument();

    const confirmCloseButton = within(dialogElement).getByRole('button', { name: 'Close Job' });
    await user.click(confirmCloseButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.closeJob).toHaveBeenCalledWith('job-senior-ai');
    });
  });

  it('triggers confirmation dialog on Delete Job action and executes mutation', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);
    mockedEmployerJobsService.deleteJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Staff ML Infrastructure Engineer')).toBeInTheDocument();
    });

    const deleteJobButtons = screen.getAllByRole('button', { name: 'Delete Job' });
    await user.click(deleteJobButtons[1]);

    const dialogElement = screen.getByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(
      within(dialogElement).getByText(
        'Deleting "Staff ML Infrastructure Engineer" is permanent and cannot be undone. Are you sure?'
      )
    ).toBeInTheDocument();

    const confirmDeleteButton = within(dialogElement).getByRole('button', { name: 'Delete Job' });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.deleteJob).toHaveBeenCalledWith('job-staff-ml');
    });
  });

  it('triggers confirmation dialog on Publish Job action and executes mutation', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);
    mockedEmployerJobsService.publishJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Staff ML Infrastructure Engineer')).toBeInTheDocument();
    });

    const publishJobButton = screen.getByRole('button', { name: 'Publish' });
    await user.click(publishJobButton);

    const dialogElement = screen.getByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(
      within(dialogElement).getByText(
        'Publishing "Staff ML Infrastructure Engineer" will make it immediately visible to job seekers.'
      )
    ).toBeInTheDocument();

    const confirmPublishButton = within(dialogElement).getByRole('button', { name: 'Publish Job' });
    await user.click(confirmPublishButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.publishJob).toHaveBeenCalledWith('job-staff-ml');
    });
  });

  it('triggers confirmation dialog on Reopen Job action and executes mutation', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);
    mockedEmployerJobsService.reopenJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Lead Data Architect')).toBeInTheDocument();
    });

    const reopenJobButton = screen.getByRole('button', { name: 'Reopen' });
    await user.click(reopenJobButton);

    const dialogElement = screen.getByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(
      within(dialogElement).getByText(
        'Reopening "Lead Data Architect" will make it live and start accepting candidate applications again.'
      )
    ).toBeInTheDocument();

    const confirmReopenButton = within(dialogElement).getByRole('button', { name: 'Reopen Job' });
    await user.click(confirmReopenButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.reopenJob).toHaveBeenCalledWith('job-closed-lead');
    });
  });

  it('renders error state with retry button when query fails', async () => {
    mockedEmployerJobsService.getDashboard.mockRejectedValue(new Error('Network connection failure'));

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Could not load dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Network connection failure')).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeInTheDocument();
  });

  it('renders semantic main landmark, header with BrandIcon and greeting, and Recent Activity section', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    const { container } = render(<EmployerDashboardClient />, { wrapper: testQueryWrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Good (morning|afternoon|evening)/i,
        })
      ).toBeInTheDocument();
    });

    const headerElement = container.querySelector('header');
    expect(headerElement).toBeInTheDocument();
    const timeOfDayIcon = headerElement?.querySelector('svg');
    expect(timeOfDayIcon).toBeInTheDocument();

    const recentJobsHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Recent Activity',
    });
    expect(recentJobsHeading).toHaveAttribute('id', 'recent-jobs-heading');

    const recentJobsSection = screen.getByRole('region', {
      name: 'Recent Activity',
    });
    expect(recentJobsSection).toBeInTheDocument();
    expect(recentJobsSection).toHaveAttribute('aria-labelledby', 'recent-jobs-heading');
  });

  it('renders primary header overview and Post a Job CTA in quick actions section', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: testQueryWrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Good (morning|afternoon|evening)/i })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Keep your open roles moving and stay close to the work that matters most.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Employer workspace')).not.toBeInTheDocument();
    expect(screen.queryByText('Ready to manage your roles')).not.toBeInTheDocument();
    expect(screen.queryByText('A clear view of every job status.')).not.toBeInTheDocument();

    const primaryPostJobLink = screen.getByRole('link', { name: /post a job/i });
    expect(primaryPostJobLink).toBeInTheDocument();
    expect(primaryPostJobLink).toHaveAttribute('href', '/job/jobpost');
  });

  it('renders empty state with explanatory guidance and actionable Post a Job link when no jobs exist', async () => {
    const emptyDashboardData: EmployerDashboardDto = {
      ...mockDashboardData,
      recentJobs: [],
    };
    mockedEmployerJobsService.getDashboard.mockResolvedValue(emptyDashboardData);

    const testQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: testQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('No jobs posted yet.')).toBeInTheDocument();
    });

    const emptyStateStatusElement = screen.getByRole('status');
    expect(emptyStateStatusElement).toBeInTheDocument();

    const emptyStateHeading = within(emptyStateStatusElement).getByRole('heading', {
      level: 3,
      name: 'No jobs posted yet.',
    });
    expect(emptyStateHeading).toBeInTheDocument();

    expect(
      within(emptyStateStatusElement).getByText(
        'Create your first job listing to begin receiving applications from qualified candidates.'
      )
    ).toBeInTheDocument();

    const emptyStatePostJobLink = within(emptyStateStatusElement).getByRole('link', {
      name: /post a job/i,
    });
    expect(emptyStatePostJobLink).toBeInTheDocument();
    expect(emptyStatePostJobLink).toHaveAttribute('href', '/job/jobpost');
  });

  it('displays alert role and error message in error state, and clicking Retry triggers query refetch', async () => {
    const dashboardError = new Error('Database connection failed');
    mockedEmployerJobsService.getDashboard.mockRejectedValue(dashboardError);

    const user = userEvent.setup();
    const testQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: testQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Could not load dashboard')).toBeInTheDocument();
    });

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();

    const errorHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Could not load dashboard',
    });
    expect(errorHeading).toHaveAttribute('id', 'dashboard-error-heading');

    expect(within(alertElement).getByText('Database connection failed')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeInTheDocument();

    expect(mockedEmployerJobsService.getDashboard).toHaveBeenCalledTimes(1);
    await user.click(retryButton);
    expect(mockedEmployerJobsService.getDashboard).toHaveBeenCalledTimes(2);
  });

  it('renders personalized greeting with user name when userName is provided', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    render(
      <EmployerDashboardClient userName="Alex Smith" userEmail="alex@company.com" />,
      { wrapper: testQueryWrapper }
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Good (morning|afternoon|evening), Alex$/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('renders fallback greeting with email username when userName is not provided', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    render(
      <EmployerDashboardClient userName={null} userEmail="alex@company.com" />,
      { wrapper: testQueryWrapper }
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Good (morning|afternoon|evening), alex$/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('renders stripped email username before @ when userName is an email address', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    render(
      <EmployerDashboardClient userName="abir13813@gmail.com" userEmail="abir13813@gmail.com" />,
      { wrapper: testQueryWrapper }
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Good (morning|afternoon|evening), abir13813$/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('renders greeting without recipient when neither userName nor userEmail is provided', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    render(
      <EmployerDashboardClient userName={null} userEmail={null} />,
      { wrapper: testQueryWrapper }
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /^Good (morning|afternoon|evening)\.$/i,
        })
      ).toBeInTheDocument();
    });
  });

  it('renders time-of-day icon inline with greeting header without duplicate greeting prefix', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    const { container } = render(<EmployerDashboardClient />, { wrapper: testQueryWrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Good (morning|afternoon|evening)/i })
      ).toBeInTheDocument();
    });

    const headerElement = container.querySelector('header');
    expect(headerElement).toBeInTheDocument();
    const timeOfDayIcon = headerElement?.querySelector('svg');
    expect(timeOfDayIcon).toBeInTheDocument();
    expect(screen.queryByText(/Good (morning|afternoon|evening) · /i)).not.toBeInTheDocument();
  });

  it('renders flat header, horizontal metrics grid, and quick action cards', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    const { container } = render(<EmployerDashboardClient />, { wrapper: testQueryWrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Good (morning|afternoon|evening)/i })
      ).toBeInTheDocument();
    });

    const headerElement = container.querySelector('header');
    expect(headerElement).toBeInTheDocument();
    expect(headerElement).toHaveClass('space-y-2');
    expect(headerElement).not.toHaveClass('lg:flex-row');

    expect(within(headerElement!).queryByRole('img', { name: 'TalentX Icon' })).toBeNull();

    const timeOfDayIcon = headerElement?.querySelector('svg');
    expect(timeOfDayIcon).toBeInTheDocument();

    const metricsSection = screen.getByRole('region', { name: /recruitment metrics/i });
    expect(metricsSection).toBeInTheDocument();
    const metricsGrid = metricsSection.querySelector('.grid.grid-cols-1.gap-4.sm\\:grid-cols-3');
    expect(metricsGrid).toBeInTheDocument();
    expect(metricsGrid?.children).toHaveLength(3);

    const actionsSection = screen.getByRole('region', { name: /quick actions/i });
    expect(actionsSection).toBeInTheDocument();
    const postJobLink = within(actionsSection).getByRole('link', { name: /post a job/i });
    expect(postJobLink).toHaveAttribute('href', '/job/jobpost');
    expect(within(postJobLink).getByText('Start hiring today')).toBeInTheDocument();
    const companyProfileLink = within(actionsSection).getByRole('link', { name: /view company profile/i });
    expect(companyProfileLink).toHaveAttribute('href', '/company');
    expect(within(companyProfileLink).getByText('Keep your company profile up to date')).toBeInTheDocument();
  });

  it('renders 2-column analytics layout containing PipelineDistributionCard and CandidateHiringPipelineCard, and full-width Recent Activity', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const testQueryWrapper = createQueryWrapper();
    render(<EmployerDashboardClient />, { wrapper: testQueryWrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: 'Job Status Overview' })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('region', { name: 'Job Status Overview' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('region', { name: 'Candidate Hiring Pipeline' })
    ).toBeInTheDocument();

    const recentActivitySection = screen.getByRole('region', { name: 'Recent Activity' });
    expect(recentActivitySection).toBeInTheDocument();
    expect(recentActivitySection).toHaveClass('w-full');
  });

  it('renders greeting with break-words and min-w-0 when user has extremely long name or email', async () => {
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);
    const longName =
      'SuperLongUnbrokenEmployerName123456789012345678901234567890';

    const testQueryWrapper = createQueryWrapper();
    const { container } = render(
      <EmployerDashboardClient userName={longName} />,
      { wrapper: testQueryWrapper }
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    const headingElement = screen.getByRole('heading', { level: 1 });
    expect(headingElement).toHaveTextContent(longName);
    expect(headingElement).toHaveClass('break-words');
    expect(headingElement).toHaveClass('[overflow-wrap:anywhere]');
    expect(headingElement).toHaveClass('min-w-0');

    const headerElement = container.querySelector('header');
    expect(headerElement).toHaveClass('min-w-0');
    expect(headerElement).toHaveClass('flex-1');
  });
});
