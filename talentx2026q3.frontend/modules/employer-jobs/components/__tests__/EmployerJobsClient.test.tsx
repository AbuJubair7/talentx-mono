import React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';

import { EmployerJobsClient } from '../EmployerJobsClient';
import { employerJobsService } from '../../services/employer-jobs.service';
import type {
  EmployerDashboardDto,
  EmployerJobListItemDto,
  PaginatedList,
} from '../../types/employer-job.types';

const mockRouterReplace = jest.fn();
let mockSearchParams = new URLSearchParams();
let replaceStateSpy: jest.SpyInstance;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockRouterReplace,
    prefetch: () => null,
  }),
  usePathname: () => '/job/job-listing',
  useSearchParams: () => mockSearchParams,
}));

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    getDashboard: jest.fn(),
    getJobs: jest.fn(),
    closeJob: jest.fn(),
    deleteJob: jest.fn(),
    publishJob: jest.fn(),
    reopenJob: jest.fn(),
    getJobPipelineSummary: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
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

const DialogTestContext = React.createContext<{ onOpenChange?: (open: boolean) => void }>({});

jest.mock('@/components/ui/dialog', () => {
  const ReactModule = require('react');
  return {
    Dialog: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) =>
      open ? (
        <DialogTestContext.Provider value={{ onOpenChange }}>
          <div role="dialog">{children}</div>
        </DialogTestContext.Provider>
      ) : null,
    DialogContent: ({
      children,
      showCloseButton = true,
      className,
    }: {
      children: React.ReactNode;
      showCloseButton?: boolean;
      className?: string;
    }) => {
      const { onOpenChange } = ReactModule.useContext(DialogTestContext);
      return (
        <div className={className}>
          {children}
          {showCloseButton && (
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange?.(false)}
            >
              Close
            </button>
          )}
        </div>
      );
    },
    DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <h2 className={className}>{children}</h2>
    ),
    DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <p className={className}>{children}</p>
    ),
    DialogClose: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
  };
});

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
  }) => React.createElement('button', { onClick, disabled, className, type }, children),
}));

const mockedEmployerJobsService = employerJobsService as jest.Mocked<typeof employerJobsService>;

const mockJobsList: PaginatedList<EmployerJobListItemDto> = {
  items: [
    {
      id: 'job-senior-ai',
      title: 'Senior AI Engineer',
      companyName: 'Acme Corp',
      status: 'Published',
      employmentType: 'FullTime',
      workArrangement: 'FullRemote',
      experienceLevel: 'SeniorLevel',
      location: 'San Francisco, CA',
      vacancies: 2,
      expireAt: '2026-10-01T10:00:00Z',
      createdAt: '2026-09-01T10:00:00Z',
      applicantCount: 15,
    },
    {
      id: 'job-ml-intern',
      title: 'Machine Learning Intern',
      companyName: 'Acme Corp',
      status: 'Draft',
      employmentType: 'Internship',
      workArrangement: 'Hybrid',
      experienceLevel: 'EntryLevel',
      location: 'New York, NY',
      vacancies: 1,
      expireAt: '2026-09-20T10:00:00Z',
      createdAt: '2026-08-20T10:00:00Z',
      applicantCount: 0,
    },
    {
      id: 'job-closed-nlp',
      title: 'NLP Research Scientist',
      companyName: 'Acme Corp',
      status: 'Closed',
      employmentType: 'FullTime',
      workArrangement: 'Hybrid',
      experienceLevel: 'SeniorLevel',
      location: 'Boston, MA',
      vacancies: 1,
      expireAt: '2030-10-01T10:00:00Z',
      createdAt: '2026-07-01T10:00:00Z',
      applicantCount: 5,
    },
  ],
  page: 1,
  pageSize: 10,
  totalCount: 25,
  totalPages: 3,
  hasPreviousPage: false,
  hasNextPage: true,
};

const mockDashboardData: EmployerDashboardDto = {
  totalPostedJobs: 25,
  totalHires: 4,
  activeJobsCount: 12,
  draftJobsCount: 3,
  closedJobsCount: 8,
  expiredJobsCount: 2,
  deactivatedJobsCount: 0,
  pendingReviewJobsCount: 0,
  recentJobs: [],
};

describe('EmployerJobsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    window.history.pushState({}, '', '/job/job-listing');
    replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);
    mockedEmployerJobsService.getJobPipelineSummary.mockResolvedValue({
      jobId: 'job-senior-ai',
      jobTitle: 'Senior AI Engineer',
      companyName: 'Acme Corp',
      jobStatus: 'Published',
      vacancies: 2,
      postedDate: '2026-09-01T10:00:00Z',
      totalApplicants: 15,
      pipelineStats: {
        appliedCount: 8,
        shortlistedCount: 4,
        invitedCount: 2,
        interviewCount: 1,
        rejectedCount: 1,
        hiredCount: 0,
      },
    });
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  afterEach(() => {
    replaceStateSpy?.mockRestore();
  });

  it('renders loading skeleton when query is loading', () => {
    mockedEmployerJobsService.getJobs.mockReturnValue(new Promise(() => {}));

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    expect(screen.getByTestId('employer-jobs-skeleton')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /loading jobs/i })).toBeInTheDocument();
    expect(screen.queryByText('Senior AI Engineer')).not.toBeInTheDocument();
  });

  it('renders status filter tabs (All, Active, Draft, Closed, Expired) with squarish styling', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    });

    const tabList = screen.getByRole('tablist', { name: 'Job status filters' });
    expect(tabList).toHaveClass('rounded-md');

    const allTab = screen.getByRole('tab', { name: 'All' });
    expect(allTab).toHaveClass('rounded-sm');

    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Draft' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Closed' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Expired' })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'false');
  });

  it('renders job table rows with title, company, applicant count, and status badge', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const tableElement = screen.getByRole('table');
    expect(within(tableElement).getByText('Senior AI Engineer')).toBeInTheDocument();
    expect(within(tableElement).getAllByText('Acme Corp').length).toBe(3);
    expect(within(tableElement).getByText('15')).toBeInTheDocument();
    expect(within(tableElement).getByText('Active')).toBeInTheDocument();

    expect(within(tableElement).getByText('Machine Learning Intern')).toBeInTheDocument();
    expect(within(tableElement).getByText('0')).toBeInTheDocument();
    expect(within(tableElement).getByText('Draft')).toBeInTheDocument();

    expect(within(tableElement).getByText('NLP Research Scientist')).toBeInTheDocument();
    expect(within(tableElement).getByText('5')).toBeInTheDocument();
    expect(within(tableElement).getByText('Closed')).toBeInTheDocument();
  });

  it('clicking status filter tab updates query parameters and synchronizes URL', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const activeTab = screen.getByRole('tab', { name: 'Active' });
    await user.click(activeTab);

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published', isExpired: false, page: 1 }),
        expect.anything()
      );
    });
    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?status=Active'
    );

    const expiredTab = screen.getByRole('tab', { name: 'Expired' });
    await user.click(expiredTab);

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ isExpired: true, page: 1 }),
        expect.anything()
      );
    });
    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?isExpired=true'
    );

    const allTab = screen.getByRole('tab', { name: 'All' });
    await user.click(allTab);

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 }),
        expect.anything()
      );
    });
    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing'
    );
  });

  it('initial mount with status=Active selects Active tab and queries published non-expired jobs', async () => {
    mockSearchParams = new URLSearchParams('status=Active');
    window.history.pushState({}, '', '/job/job-listing?status=Active');
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');

    expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'Published', isExpired: false, page: 1 }),
      expect.anything()
    );
  });

  it('initial mount with status=Published backward compatibility selects Active tab and queries published non-expired jobs', async () => {
    mockSearchParams = new URLSearchParams('status=Published');
    window.history.pushState({}, '', '/job/job-listing?status=Published');
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');

    expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'Published', isExpired: false, page: 1 }),
      expect.anything()
    );
  });

  it('resets query parameters and active tab to All when URL status and isExpired parameters are removed', async () => {
    mockSearchParams = new URLSearchParams('status=Active');
    window.history.pushState({}, '', '/job/job-listing?status=Active');
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const TestQueryWrapper = createQueryWrapper();
    const { rerender } = render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');

    mockSearchParams = new URLSearchParams();
    rerender(<EmployerJobsClient />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true');
    });
    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'false');
  });

  it('search input queries API with debounced searchTerm and renders filtered results', async () => {
    mockedEmployerJobsService.getJobs.mockImplementation(async (queryParams) => {
      if (queryParams?.searchTerm) {
        const normalizedSearchTerm = queryParams.searchTerm.toLowerCase();
        const matchingJobs = mockJobsList.items.filter((job) =>
          job.title.toLowerCase().includes(normalizedSearchTerm)
        );
        return {
          ...mockJobsList,
          items: matchingJobs,
          totalCount: matchingJobs.length,
          totalPages: 1,
        };
      }
      return mockJobsList;
    });

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('Machine Learning Intern')).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    await user.type(searchInput, 'Senior');

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: 'Senior', page: 1 }),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Machine Learning Intern')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
  });

  it('typing in search input queries page 1 with searchTerm and synchronizes URL', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    await user.type(searchInput, 'AI');

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: 'AI', page: 1 }),
        expect.anything()
      );
    });

    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?search=AI'
    );
  });

  it('initializes search input and loads filtered results when search URL parameter is present', async () => {
    mockSearchParams = new URLSearchParams('search=Senior');
    window.history.pushState({}, '', '/job/job-listing?search=Senior');
    mockedEmployerJobsService.getJobs.mockResolvedValue({
      ...mockJobsList,
      items: [mockJobsList.items[0]],
      totalCount: 1,
      totalPages: 1,
    });

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    expect(searchInput).toHaveValue('Senior');

    expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
      expect.objectContaining({ searchTerm: 'Senior', page: 1 }),
      expect.anything()
    );
    expect(screen.queryByText('Machine Learning Intern')).not.toBeInTheDocument();
  });

  it('clearing search input removes search parameter from URL and fetches unfiltered jobs', async () => {
    mockSearchParams = new URLSearchParams('search=Senior');
    window.history.pushState({}, '', '/job/job-listing?search=Senior');
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    await user.clear(searchInput);

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, searchTerm: undefined }),
        expect.anything()
      );
    }, { timeout: 3000 });

    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing'
    );
  });

  it('preserves existing status tab filter and URL parameters when searching', async () => {
    mockSearchParams = new URLSearchParams('status=Active');
    window.history.pushState({}, '', '/job/job-listing?status=Active');
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    await user.type(searchInput, 'Senior');

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published', isExpired: false, searchTerm: 'Senior', page: 1 }),
        expect.anything()
      );
    });

    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?status=Active&search=Senior'
    );
  });

  it('switching status tab preserves searchTerm in query parameters and updates URL', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    await user.type(searchInput, 'AI');

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: 'AI', page: 1 }),
        expect.anything()
      );
    });

    const activeTab = screen.getByRole('tab', { name: 'Active' });
    await user.click(activeTab);

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published', isExpired: false, searchTerm: 'AI', page: 1 }),
        expect.anything()
      );
    });
    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?status=Active&search=AI'
    );
  });

  it('switching tab synchronizes URL and subsequent search maintains active tab in URL', async () => {
    mockSearchParams = new URLSearchParams();
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const activeTab = screen.getByRole('tab', { name: 'Active' });
    await user.click(activeTab);

    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?status=Active'
    );

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    await user.type(searchInput, 'Engineer');

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Published', isExpired: false, searchTerm: 'Engineer', page: 1 }),
        expect.anything()
      );
    });

    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?status=Active&search=Engineer'
    );
  });

  it('switching to Expired tab and subsequent search maintains isExpired in URL', async () => {
    mockSearchParams = new URLSearchParams();
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    const expiredTab = screen.getByRole('tab', { name: 'Expired' });
    await user.click(expiredTab);

    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?isExpired=true'
    );

    const searchInput = screen.getByRole('searchbox', { name: /search jobs/i });
    await user.type(searchInput, 'Intern');

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ isExpired: true, searchTerm: 'Intern', page: 1 }),
        expect.anything()
      );
    });

    expect(replaceStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/job/job-listing?isExpired=true&search=Intern'
    );
  });

  it('clicking Close Job triggers confirm dialog and mutation', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    mockedEmployerJobsService.closeJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

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

  it('clicking Delete Job triggers confirm dialog and mutation', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    mockedEmployerJobsService.deleteJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning Intern')).toBeInTheDocument();
    });

    const deleteJobButtons = screen.getAllByRole('button', { name: 'Delete Job' });
    await user.click(deleteJobButtons[1]);

    const dialogElement = screen.getByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(
      within(dialogElement).getByText(
        'Deleting "Machine Learning Intern" is permanent and cannot be undone. Are you sure?'
      )
    ).toBeInTheDocument();

    const confirmDeleteButton = within(dialogElement).getByRole('button', { name: 'Delete Job' });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.deleteJob).toHaveBeenCalledWith('job-ml-intern');
    });
  });

  it('clicking Publish triggers confirm dialog and mutation', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    mockedEmployerJobsService.publishJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning Intern')).toBeInTheDocument();
    });

    const publishJobButton = screen.getByRole('button', { name: 'Publish' });
    await user.click(publishJobButton);

    const dialogElement = screen.getByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(
      within(dialogElement).getByText(
        'Publishing "Machine Learning Intern" will make it immediately visible to job seekers.'
      )
    ).toBeInTheDocument();

    const confirmPublishButton = within(dialogElement).getByRole('button', { name: 'Publish Job' });
    await user.click(confirmPublishButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.publishJob).toHaveBeenCalledWith('job-ml-intern');
    });
  });

  it('clicking Reopen triggers confirm dialog and mutation', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    mockedEmployerJobsService.reopenJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('NLP Research Scientist')).toBeInTheDocument();
    });

    const reopenJobButton = screen.getByRole('button', { name: 'Reopen' });
    await user.click(reopenJobButton);

    const dialogElement = screen.getByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(
      within(dialogElement).getByText(
        'Reopening "NLP Research Scientist" will make it live and start accepting candidate applications again.'
      )
    ).toBeInTheDocument();

    const confirmReopenButton = within(dialogElement).getByRole('button', { name: 'Reopen Job' });
    await user.click(confirmReopenButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.reopenJob).toHaveBeenCalledWith('job-closed-nlp');
    });
  });

  it('renders infinite scroll sentinel and shows all jobs text when end reached without pagination buttons', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue({
      ...mockJobsList,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
    });

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('Showing all 25 jobs')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('triggers fetchNextPage when intersection observer fires for scroll sentinel', async () => {
    let observerCallback: IntersectionObserverCallback = () => {};
    window.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      observerCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });

    mockedEmployerJobsService.getJobs
      .mockResolvedValueOnce(mockJobsList)
      .mockResolvedValueOnce({
        ...mockJobsList,
        page: 2,
        items: [
          {
            ...mockJobsList.items[0],
            id: 'job-page-2-ai',
            title: 'Lead AI Engineer',
          },
        ],
      });

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(mockedEmployerJobsService.getJobs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
        expect.anything()
      );
    });
  });

  it('renders floating Back to Top button when scrolled down and scrolls smoothly on click', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    const scrollToSpy = jest.fn();
    window.scrollTo = scrollToSpy;

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('Senior AI Engineer')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /back to top/i })).not.toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 350, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();
    });

    const backToTopButton = screen.getByRole('button', { name: /back to top/i });
    await user.click(backToTopButton);

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('renders empty state when no jobs match', async () => {
    const emptyJobsList: PaginatedList<EmployerJobListItemDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    mockedEmployerJobsService.getJobs.mockResolvedValue(emptyJobsList);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText('No jobs found.')).toBeInTheDocument();
    });

    expect(screen.getByText('No jobs found.')).toBeInTheDocument();
    const postAJobLinks = screen.getAllByRole('link', { name: /post a job/i });
    expect(postAJobLinks.length).toBeGreaterThanOrEqual(1);
    expect(postAJobLinks[0]).toHaveAttribute('href', '/job/jobpost');
  });

  it('switches between List and Card view and renders the appropriate layout', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('employer-jobs-cards-grid')).not.toBeInTheDocument();

    const viewSwitchGroup = screen.getByRole('group', { name: 'View switch' });
    expect(viewSwitchGroup).toHaveClass('rounded-md');

    const cardViewButton = screen.getByRole('button', { name: 'Card view' });
    expect(cardViewButton).toHaveClass('rounded-sm');
    await user.click(cardViewButton);

    expect(screen.getByTestId('employer-jobs-cards-grid')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByTestId('job-card-job-senior-ai')).toBeInTheDocument();
    expect(screen.getByTestId('job-card-job-ml-intern')).toBeInTheDocument();

    const listViewButton = screen.getByRole('button', { name: 'List view' });
    expect(listViewButton).toHaveClass('rounded-sm');
    await user.click(listViewButton);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByTestId('employer-jobs-cards-grid')).not.toBeInTheDocument();
  });

  it('supports opening close and delete job dialogs from Card view', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    mockedEmployerJobsService.closeJob.mockResolvedValue(undefined);
    mockedEmployerJobsService.deleteJob.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const cardViewButton = screen.getByRole('button', { name: 'Card view' });
    await user.click(cardViewButton);

    expect(screen.getByTestId('employer-jobs-cards-grid')).toBeInTheDocument();

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

    const deleteJobButtons = screen.getAllByRole('button', { name: 'Delete Job' });
    await user.click(deleteJobButtons[1]);

    const deleteDialogElement = screen.getByRole('dialog');
    expect(deleteDialogElement).toBeInTheDocument();
    expect(
      within(deleteDialogElement).getByText(
        'Deleting "Machine Learning Intern" is permanent and cannot be undone. Are you sure?'
      )
    ).toBeInTheDocument();

    const confirmDeleteButton = within(deleteDialogElement).getByRole('button', { name: 'Delete Job' });
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockedEmployerJobsService.deleteJob).toHaveBeenCalledWith('job-ml-intern');
    });
  });

  it('reads view mode from and persists view mode to localStorage', async () => {
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    getItemSpy.mockReturnValueOnce('cards');
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    const { unmount } = render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByTestId('employer-jobs-cards-grid')).toBeInTheDocument();
    });

    const listViewButton = screen.getByRole('button', { name: 'List view' });
    await user.click(listViewButton);

    expect(setItemSpy).toHaveBeenCalledWith('talentx_employer_jobs_view_mode', 'list');
    expect(screen.getByRole('table')).toBeInTheDocument();

    unmount();
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('renders error state with retry button when query fails', async () => {
    mockedEmployerJobsService.getJobs.mockRejectedValue(new Error('Network connection failed'));

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByText("Couldn't load your jobs")).toBeInTheDocument();
    });

    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeInTheDocument();
  });

  it('renders hero header with title, subtitle, post a job button, and 3 metric cards', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    mockedEmployerJobsService.getDashboard.mockResolvedValue(mockDashboardData);

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    expect(screen.getByRole('heading', { level: 1, name: 'Jobs' })).toBeInTheDocument();
    expect(
      screen.getByText('View and manage all jobs across their hiring lifecycle.')
    ).toBeInTheDocument();

    const postAJobLinks = screen.getAllByRole('link', { name: /post a job/i });
    expect(postAJobLinks[0]).toHaveAttribute('href', '/job/jobpost');

    await waitFor(() => {
      const totalJobsLabel = screen.getByText('Total Jobs');
      const activeJobsLabel = screen.getByText('Active Jobs');
      const draftJobsLabel = screen.getByText('Draft Jobs');
      expect(totalJobsLabel).toBeInTheDocument();
      expect(activeJobsLabel).toBeInTheDocument();
      expect(draftJobsLabel).toBeInTheDocument();
      expect(within(totalJobsLabel.parentElement!).getByText('25')).toBeInTheDocument();
      expect(within(activeJobsLabel.parentElement!).getByText('12')).toBeInTheDocument();
      expect(within(draftJobsLabel.parentElement!).getByText('3')).toBeInTheDocument();
    });
  });

  it('renders skeleton pulse in metric cards when dashboard query is loading', () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);
    mockedEmployerJobsService.getDashboard.mockReturnValue(new Promise(() => {}));

    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    const totalJobsLabel = screen.getByText('Total Jobs');
    const activeJobsLabel = screen.getByText('Active Jobs');
    const draftJobsLabel = screen.getByText('Draft Jobs');

    expect(totalJobsLabel).toBeInTheDocument();
    expect(activeJobsLabel).toBeInTheDocument();
    expect(draftJobsLabel).toBeInTheDocument();

    const pulseSpans = totalJobsLabel.parentElement!.querySelectorAll('.animate-pulse');
    expect(pulseSpans.length).toBe(1);
  });

  it('clicking a job card in card view opens JobPipelineSummaryDialog and closing it dismisses the dialog', async () => {
    mockedEmployerJobsService.getJobs.mockResolvedValue(mockJobsList);

    const user = userEvent.setup();
    const TestQueryWrapper = createQueryWrapper();
    render(<EmployerJobsClient />, { wrapper: TestQueryWrapper });

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const cardViewButton = screen.getByRole('button', { name: 'Card view' });
    await user.click(cardViewButton);

    const firstJobCard = screen.getByTestId('job-card-job-senior-ai');
    expect(firstJobCard).toBeInTheDocument();

    await user.click(firstJobCard);

    const dialogElement = await screen.findByRole('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(within(dialogElement).getByRole('heading', { level: 2, name: 'Senior AI Engineer' })).toBeInTheDocument();
    expect(mockedEmployerJobsService.getJobPipelineSummary).toHaveBeenCalledWith(
      'job-senior-ai',
      expect.anything()
    );

    const closeButton = within(dialogElement).getByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

