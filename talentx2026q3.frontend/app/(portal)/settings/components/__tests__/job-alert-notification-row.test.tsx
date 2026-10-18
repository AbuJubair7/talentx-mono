import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/modules/job-alerts';
import { JobAlertNotificationRow } from '../job-alert-notification-row';

jest.mock('@/modules/job-alerts', () => ({
  useNotificationPreferences: jest.fn(),
  useUpdateNotificationPreferences: jest.fn(),
}));

const mockedUseNotificationPreferences = useNotificationPreferences as jest.Mock;
const mockedUseUpdateNotificationPreferences = useUpdateNotificationPreferences as jest.Mock;

describe('JobAlertNotificationRow Component', () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUpdateNotificationPreferences.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders enabled state with Active badge and Enabled label', () => {
    mockedUseNotificationPreferences.mockReturnValue({
      data: { jobAlertsEmailEnabled: true },
      isPending: false,
    });

    render(<JobAlertNotificationRow />);

    expect(screen.getByText('Job Alert Emails')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();

    const switchElement = screen.getByLabelText('Toggle job alert email notifications');
    expect(switchElement).toBeInTheDocument();
  });

  it('renders paused state when email notifications are disabled', () => {
    mockedUseNotificationPreferences.mockReturnValue({
      data: { jobAlertsEmailEnabled: false },
      isPending: false,
    });

    render(<JobAlertNotificationRow />);

    expect(screen.queryByText('Active')).not.toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('triggers mutation when switch is toggled', () => {
    mockedUseNotificationPreferences.mockReturnValue({
      data: { jobAlertsEmailEnabled: true },
      isPending: false,
    });

    render(<JobAlertNotificationRow />);

    const switchElement = screen.getByLabelText('Toggle job alert email notifications');
    fireEvent.click(switchElement);

    expect(mockMutate).toHaveBeenCalledWith({
      jobAlertsEmailEnabled: false,
    });
  });
});
