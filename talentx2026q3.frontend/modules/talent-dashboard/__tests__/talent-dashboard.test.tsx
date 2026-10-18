import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TalentDashboard } from '../components/talent-dashboard';
import { useTalentApplications } from '../hooks/use-talent-applications';
import { useTalentApplicationCounts } from '../hooks/use-talent-application-counts';
import { useTalentInvitations } from '../hooks/use-talent-invitations';
import { useTalentMatches } from '../hooks/use-talent-matches';
import { useSavedJobs, useRemoveSavedJob } from '@/modules/saved-jobs';
import { useTalentProfile } from '@/modules/talent-profile/hooks/useTalentProfile';
import { useMyCompanyReviews } from '@/modules/company-review';

jest.mock('../hooks/use-talent-applications');
jest.mock('../hooks/use-talent-application-counts');
jest.mock('../hooks/use-talent-invitations');
jest.mock('../hooks/use-talent-matches');
jest.mock('@/modules/saved-jobs');
jest.mock('@/modules/talent-profile/hooks/useTalentProfile');
jest.mock('@/modules/company-review', () => ({
  COMPANY_REVIEW_PAGE_NUMBER: 1,
  COMPANY_REVIEW_PAGE_SIZE: 10,
  useMyCompanyReviews: jest.fn(),
  TalentReviewsTab: () =>
    jest
      .requireActual<typeof import('react')>('react')
      .createElement('div', { 'data-testid': 'talent-reviews-tab' }),
}));

const mockUseTalentProfile = useTalentProfile as jest.MockedFunction<typeof useTalentProfile>;

const mockUseTalentApplications = useTalentApplications as jest.MockedFunction<typeof useTalentApplications>;
const mockUseTalentApplicationCounts = useTalentApplicationCounts as jest.MockedFunction<typeof useTalentApplicationCounts>;
const mockUseTalentInvitations = useTalentInvitations as jest.MockedFunction<typeof useTalentInvitations>;
const mockUseTalentMatches = useTalentMatches as jest.MockedFunction<typeof useTalentMatches>;
const mockUseSavedJobs = useSavedJobs as jest.MockedFunction<typeof useSavedJobs>;
const mockUseRemoveSavedJob = useRemoveSavedJob as jest.MockedFunction<typeof useRemoveSavedJob>;
const mockUseMyCompanyReviews = useMyCompanyReviews as jest.MockedFunction<typeof useMyCompanyReviews>;

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('TalentDashboard Component', () => {
  const mockApplications = [
    {
      id: 'app-1',
      jobId: 'job-101',
      jobTitle: 'Senior Frontend Engineer',
      company: 'TechCorp Inc',
      appliedDate: new Date().toISOString(),
      status: 'Applied' as const,
    },
    {
      id: 'app-2',
      jobId: 'job-102',
      jobTitle: 'Fullstack Developer',
      company: 'Innovate Labs',
      appliedDate: '2026-08-01T10:00:00Z',
      status: 'Interview' as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    mockUseTalentApplications.mockReturnValue({
      data: {
        items: mockApplications,
        page: 1,
        pageSize: 10,
        totalCount: 25,
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseTalentApplicationCounts.mockReturnValue({
      data: {
        total: 25,
        applied: 12,
        interviews: 6,
        offers: 2,
        rejected: 5,
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseTalentInvitations.mockReturnValue({
      data: {
        items: [],
        page: 1,
        pageSize: 10,
        totalCount: 4,
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseTalentMatches.mockReturnValue({
      data: {
        items: [],
        page: 1,
        pageSize: 10,
        totalCount: 8,
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseSavedJobs.mockReturnValue({
      data: {
        items: [
          {
            savedJobId: 'saved-1',
            jobId: 'job-201',
            jobTitle: 'Product Designer',
            companyName: 'DesignWorks',
            location: 'Remote',
            employmentType: 'FullTime',
            postedDate: '2026-08-20T00:00:00Z',
            isAvailable: true,
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 3,
      },
      isLoading: false,
      isError: false,
    } as any);

    mockUseRemoveSavedJob.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      variables: undefined,
    } as any);

    mockUseTalentProfile.mockReturnValue({
      data: { name: 'Ada Lovelace' },
    } as any);

    mockUseMyCompanyReviews.mockReturnValue({
      data: { items: [], page: 1, pageSize: 10, totalCount: 2, totalPages: 1 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMyCompanyReviews>);
  });

  it('greets the talent by first name from their profile', () => {
    renderWithClient(<TalentDashboard />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      /, Ada$/
    );
  });

  it('renders overall stat counts', () => {
    renderWithClient(<TalentDashboard />);

    // Overview stats show backend counts (Total in center label / legend rows for each segment)
    expect(screen.getByText('Total').closest('div')).toHaveTextContent('25');
    expect(screen.getByText('Interviews').closest('div')?.parentElement).toHaveTextContent('6');
    expect(screen.getByText('Offers').closest('div')?.parentElement).toHaveTextContent('2');

    // 'Rejected' also labels a status filter button, so pick the legend row
    const rejectedLegend = screen
      .getAllByText('Rejected')
      .find((el) => el.closest('div')?.parentElement?.textContent?.includes('5'));
    expect(rejectedLegend?.closest('div')?.parentElement).toHaveTextContent('5');

    // Invitations total surfaces on the Invitations tab badge
    expect(screen.getByRole('button', { name: /Invitations/i })).toHaveTextContent('4');
  });

  it('allows user to dynamically configure weekly goal and persists to localStorage', async () => {
    const user = userEvent.setup();
    renderWithClient(<TalentDashboard />);

    // Default goal is 10
    expect(screen.getByText('of 10 applications')).toBeInTheDocument();

    // Click edit button
    const editBtn = screen.getByRole('button', { name: /Edit weekly goal/i });
    await user.click(editBtn);

    // Preset options visible
    const preset15 = screen.getByRole('button', { name: '15' });
    expect(preset15).toBeInTheDocument();

    // Click preset 15
    await user.click(preset15);

    // Should update to 15 applications and save in localStorage
    expect(screen.getByText('of 15 applications')).toBeInTheDocument();
    expect(localStorage.getItem('talentx_weekly_goal')).toBe('15');
  });

  it('handles search input and clear button', async () => {
    const user = userEvent.setup();
    renderWithClient(<TalentDashboard />);

    const searchInput = screen.getByPlaceholderText('Search by company or role…');
    await user.type(searchInput, 'Frontend');
    expect(searchInput).toHaveValue('Frontend');

    // Clear search button appears
    const clearBtn = screen.getByRole('button', { name: /Clear search/i });
    expect(clearBtn).toBeInTheDocument();

    await user.click(clearBtn);
    expect(searchInput).toHaveValue('');
  });

  it('switches status filter and resets page without changing weekly goal value', async () => {
    const user = userEvent.setup();
    renderWithClient(<TalentDashboard />);

    // Weekly goal shows 1 of 10 with 9 more to go (from mock applications applied this week)
    expect(screen.getByText('of 10 applications')).toBeInTheDocument();
    expect(screen.getByText('9 more')).toBeInTheDocument();

    const interviewFilterBtn = screen.getByRole('button', { name: 'Interview' });
    await user.click(interviewFilterBtn);

    expect(mockUseTalentApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Interview',
        page: 1,
      })
    );

    // Weekly goal count still shows 1 of 10 with 9 more to go
    expect(screen.getByText('of 10 applications')).toBeInTheDocument();
    expect(screen.getByText('9 more')).toBeInTheDocument();
  });

  it('shows a Saved Jobs tab with the saved-jobs total count as its badge', () => {
    renderWithClient(<TalentDashboard />);

    const savedJobsTab = screen.getByRole('button', { name: /Saved Jobs/i });
    expect(savedJobsTab).toBeInTheDocument();
    expect(savedJobsTab).toHaveTextContent('3');
  });

  it('switches to the Saved Jobs tab and renders the saved jobs table', async () => {
    const user = userEvent.setup();
    renderWithClient(<TalentDashboard />);

    await user.click(screen.getByRole('button', { name: /Saved Jobs/i }));

    expect(screen.getByText('DesignWorks')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Product Designer' })).toHaveAttribute(
      'href',
      '/jobs/job-201'
    );
  });
  it('shows a Reviews tab after Saved Jobs with the reviews total as its badge', () => {
    renderWithClient(<TalentDashboard />);

    const tabLabels = screen
      .getAllByRole('button')
      .map((button) => button.textContent ?? '')
      .filter((text) => /^(Applications|Invitations|Recommended|Saved Jobs|Reviews)\d*$/.test(text));

    expect(tabLabels).toEqual([
      'Applications25',
      'Invitations4',
      'Recommended8',
      'Saved Jobs3',
      'Reviews2',
    ]);
  });

  it('only renders the reviews tab body once the Reviews tab is selected', async () => {
    const user = userEvent.setup();
    renderWithClient(<TalentDashboard />);

    expect(screen.queryByTestId('talent-reviews-tab')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reviews/i }));

    expect(screen.getByTestId('talent-reviews-tab')).toBeInTheDocument();
    // Applications-only search box is gone with the applications tab.
    expect(screen.queryByPlaceholderText('Search by company or role…')).not.toBeInTheDocument();
  });

  it('switches back from the Reviews tab to another tab', async () => {
    const user = userEvent.setup();
    renderWithClient(<TalentDashboard />);

    await user.click(screen.getByRole('button', { name: /Reviews/i }));
    await user.click(screen.getByRole('button', { name: /Saved Jobs/i }));

    expect(screen.queryByTestId('talent-reviews-tab')).not.toBeInTheDocument();
    expect(screen.getByText('DesignWorks')).toBeInTheDocument();
  });

  it('requests the first page of reviews for the tab badge', () => {
    renderWithClient(<TalentDashboard />);

    expect(mockUseMyCompanyReviews).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });
});
