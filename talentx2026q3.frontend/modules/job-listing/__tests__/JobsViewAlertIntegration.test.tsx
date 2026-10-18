import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useHeaderSession } from '@/components/common/use-header-session';
import { useCreateJobAlert } from '@/modules/job-alerts';
import { useSavedJobIds, useSaveJob, useRemoveSavedJob } from '@/modules/saved-jobs';
import { useJobFilters } from '../hooks/useJobFilters';
import { usePublishedJobs } from '../hooks/usePublishedJobs';
import { JobsView } from '../components/JobsView';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/common/use-header-session', () => ({
  useHeaderSession: jest.fn(),
}));

jest.mock('@/modules/job-alerts', () => ({
  useCreateJobAlert: jest.fn(),
}));

jest.mock('@/modules/saved-jobs', () => ({
  useSavedJobIds: jest.fn(),
  useSaveJob: jest.fn(),
  useRemoveSavedJob: jest.fn(),
}));

jest.mock('../hooks/useJobFilters', () => ({
  useJobFilters: jest.fn(),
}));

jest.mock('../hooks/usePublishedJobs', () => ({
  usePublishedJobs: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedUseHeaderSession = useHeaderSession as jest.Mock;
const mockedUseCreateJobAlert = useCreateJobAlert as jest.Mock;
const mockedUseSavedJobIds = useSavedJobIds as jest.Mock;
const mockedUseSaveJob = useSaveJob as jest.Mock;
const mockedUseRemoveSavedJob = useRemoveSavedJob as jest.Mock;
const mockedUseJobFilters = useJobFilters as jest.Mock;
const mockedUsePublishedJobs = usePublishedJobs as jest.Mock;

describe('JobsView Alert Integration', () => {
  const mockFilters = {
    keyword: 'Cloud Architect',
    location: 'Remote',
    employmentType: 'FullTime',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'FullRemote',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: jest.fn() });
    mockedUseCreateJobAlert.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    mockedUseSavedJobIds.mockReturnValue({ data: [] });
    mockedUseSaveJob.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockedUseRemoveSavedJob.mockReturnValue({ mutate: jest.fn(), isPending: false });

    mockedUseJobFilters.mockReturnValue({
      filters: mockFilters,
      hasActiveFilters: true,
      setKeyword: jest.fn(),
      setLocation: jest.fn(),
      setSearch: jest.fn(),
      setEmploymentType: jest.fn(),
      setExperienceLevel: jest.fn(),
      setWorkArrangement: jest.fn(),
      setPage: jest.fn(),
      clearFilter: jest.fn(),
      clearAllFilters: jest.fn(),
    });

    mockedUsePublishedJobs.mockReturnValue({
      data: {
        items: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      },
      isPending: false,
      isFetching: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders "Create Job Alert" button and opens dialog when clicked', () => {
    mockedUseHeaderSession.mockReturnValue({
      isAuthenticated: true,
      isTalent: true,
      isEmployer: false,
    });

    render(<JobsView />);

    const alertButtons = screen.getAllByRole('button', { name: /Create.*Alert/i });
    expect(alertButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(alertButtons[0]);

    expect(screen.getByRole('heading', { name: 'Create Job Alert' })).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Alert Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Cloud Architect in Remote Alert');
  });

  it('hides "Create Job Alert" buttons for employer users', () => {
    mockedUseHeaderSession.mockReturnValue({
      isAuthenticated: true,
      isTalent: false,
      isEmployer: true,
    });

    render(<JobsView />);

    expect(screen.queryByRole('button', { name: 'Create Job Alert' })).not.toBeInTheDocument();
  });

  it('shows the resume promo card for authenticated talent', () => {
    mockedUseHeaderSession.mockReturnValue({
      isAuthenticated: true,
      isTalent: true,
      isEmployer: false,
    });

    render(<JobsView />);

    expect(screen.getByText('Boost Your Visibility')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Update Resume/i })).toHaveAttribute(
      'href',
      '/profile?tab=media-resume',
    );
  });

  it('hides the resume promo card for guests and employers', () => {
    mockedUseHeaderSession.mockReturnValue({
      isAuthenticated: false,
      isTalent: false,
      isEmployer: false,
    });
    const { rerender } = render(<JobsView />);
    expect(screen.queryByText('Boost Your Visibility')).not.toBeInTheDocument();

    mockedUseHeaderSession.mockReturnValue({
      isAuthenticated: true,
      isTalent: false,
      isEmployer: true,
    });
    rerender(<JobsView />);
    expect(screen.queryByText('Boost Your Visibility')).not.toBeInTheDocument();
  });
});
