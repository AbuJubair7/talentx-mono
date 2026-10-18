import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApplicationsTable } from '../applications-table';
import type { TalentApplication } from '../../types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../application-timeline', () => ({
  ApplicationTimeline: ({ applicationId }: { applicationId: string }) => (
    <div data-testid={`timeline-${applicationId}`}>Timeline</div>
  ),
}));

function buildApp(overrides: Partial<TalentApplication> = {}): TalentApplication {
  return {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    company: 'Acme Corp',
    appliedDate: '2026-09-01T12:00:00Z',
    status: 'Applied',
    ...overrides,
  };
}

function renderTable(apps: TalentApplication[] = [buildApp()]) {
  return render(
    <ApplicationsTable applications={apps} isLoading={false} isError={false} />
  );
}

beforeEach(() => jest.clearAllMocks());

describe('ApplicationsTable timeline expansion', () => {
  it('renders a timeline toggle per row without expanding by default', () => {
    renderTable();

    expect(
      screen.getByRole('button', { name: 'Show status timeline' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('timeline-app-1')).not.toBeInTheDocument();
  });

  it('expands the timeline on toggle click without navigating', async () => {
    renderTable();

    await userEvent.click(screen.getByRole('button', { name: 'Show status timeline' }));

    expect(screen.getByTestId('timeline-app-1')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Hide status timeline' })
    ).toBeInTheDocument();
  });

  it('collapses the timeline on a second toggle click', async () => {
    renderTable();

    const toggle = screen.getByRole('button', { name: 'Show status timeline' });
    await userEvent.click(toggle);
    expect(screen.getByTestId('timeline-app-1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hide status timeline' }));
    expect(screen.queryByTestId('timeline-app-1')).not.toBeInTheDocument();
  });

  it('still navigates to job details when the row itself is clicked', async () => {
    renderTable();

    await userEvent.click(screen.getByText('Acme Corp'));
    expect(mockPush).toHaveBeenCalledWith('/jobs/job-1');
  });
});
