import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { JobAlert } from '../../types';
import {
  useJobAlerts,
  useNotificationPreferences,
  useToggleJobAlert,
  useUpdateNotificationPreferences,
} from '../../hooks';
import { JobAlertsView } from '../JobAlertsView';

jest.mock('../../hooks', () => ({
  useJobAlerts: jest.fn(),
  useNotificationPreferences: jest.fn(),
  useToggleJobAlert: jest.fn(),
  useUpdateNotificationPreferences: jest.fn(),
  useUpdateJobAlert: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useDeleteJobAlert: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
  useCreateJobAlert: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('@/components/common/use-header-session', () => ({
  useHeaderSession: jest.fn(() => ({
    isAuthenticated: true,
    isTalent: true,
    isEmployer: false,
  })),
}));

const mockedUseJobAlerts = useJobAlerts as jest.Mock;
const mockedUseNotificationPreferences = useNotificationPreferences as jest.Mock;
const mockedUseToggleJobAlert = useToggleJobAlert as jest.Mock;
const mockedUseUpdateNotificationPreferences = useUpdateNotificationPreferences as jest.Mock;

const sampleAlerts: JobAlert[] = [
  {
    id: 'alert-1',
    name: 'Senior Frontend Roles',
    title: 'Frontend Engineer',
    location: 'Remote',
    employmentType: 'FullTime',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'FullRemote',
    isEnabled: true,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'alert-2',
    name: 'AI Research Roles',
    title: 'Machine Learning',
    location: null,
    employmentType: null,
    experienceLevel: null,
    workArrangement: null,
    isEnabled: false,
    createdAt: '2026-03-02T10:00:00Z',
  },
];

describe('JobAlertsView Component', () => {
  const mockToggleMutate = jest.fn();
  const mockUpdatePreferencesMutate = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseJobAlerts.mockReturnValue({
      data: sampleAlerts,
      isPending: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });
    mockedUseNotificationPreferences.mockReturnValue({
      data: { jobAlertsEmailEnabled: true },
      isPending: false,
    });
    mockedUseToggleJobAlert.mockReturnValue({
      mutate: mockToggleMutate,
      isPending: false,
    });
    mockedUseUpdateNotificationPreferences.mockReturnValue({
      mutate: mockUpdatePreferencesMutate,
      isPending: false,
    });
  });

  it('renders loading skeletons when alerts are pending', () => {
    mockedUseJobAlerts.mockReturnValue({
      data: [],
      isPending: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    const { container } = render(<JobAlertsView />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders error state and handles retry button click', () => {
    mockedUseJobAlerts.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
      error: { message: 'Network timeout' },
      refetch: mockRefetch,
    });

    render(<JobAlertsView />);

    expect(screen.getByText("Couldn't load job alerts")).toBeInTheDocument();
    expect(screen.getByText('Network timeout')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when candidate has no configured alerts', () => {
    mockedUseJobAlerts.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<JobAlertsView />);

    expect(screen.getByText('No Job Alerts Configured')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Create Your First Alert/i })
    ).toBeInTheDocument();
  });

  it('renders alert cards, criteria pills, and header stats', () => {
    render(<JobAlertsView />);

    expect(screen.getByText('Job Search Alerts')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/10 Saved/i)).toBeInTheDocument();

    // First alert card
    expect(screen.getByText('Senior Frontend Roles')).toBeInTheDocument();
    expect(screen.getByText('Role: Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Location: Remote')).toBeInTheDocument();
    expect(screen.getAllByText('Active').length).toBe(2);

    // Second alert card
    expect(screen.getByText('AI Research Roles')).toBeInTheDocument();
    expect(screen.getByText('Role: Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('triggers global email notification toggle mutation when switch is clicked', () => {
    render(<JobAlertsView />);

    const globalSwitch = screen.getByLabelText(
      'Toggle email notifications for saved alerts'
    );
    expect(globalSwitch).toBeInTheDocument();

    fireEvent.click(globalSwitch);
    expect(mockUpdatePreferencesMutate).toHaveBeenCalledWith({
      jobAlertsEmailEnabled: false,
    });
  });

  it('triggers alert active toggle mutation when individual card switch is clicked', () => {
    render(<JobAlertsView />);

    const firstAlertSwitch = screen.getByLabelText(
      'Toggle alert for Senior Frontend Roles'
    );
    fireEvent.click(firstAlertSwitch);

    expect(mockToggleMutate).toHaveBeenCalledWith({
      id: 'alert-1',
      isEnabled: false,
    });
  });

  it('opens delete dialog when Delete button on card is clicked', () => {
    render(<JobAlertsView />);

    const deleteButtons = screen.getAllByRole('button', { name: /^Delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText('Delete Job Alert')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('links to public jobs page with alert filter parameters', () => {
    render(<JobAlertsView />);

    const matchingJobsLinks = screen.getAllByRole('link', {
      name: /View Matching Jobs/i,
    });
    expect(matchingJobsLinks[0]).toHaveAttribute(
      'href',
      '/jobs?keyword=Frontend+Engineer&location=Remote&employmentType=FullTime&experienceLevel=SeniorLevel&workArrangement=FullRemote'
    );
  });
});
