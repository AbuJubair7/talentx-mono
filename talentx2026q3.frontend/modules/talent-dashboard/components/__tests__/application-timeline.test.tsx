import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApplicationTimeline } from '../application-timeline';
import { useApplicationStatusHistory } from '../../hooks/use-application-status-history';
import type { ApplicationStatusHistoryEvent } from '../../types';

jest.mock('../../hooks/use-application-status-history');

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockedUseHistory = useApplicationStatusHistory as jest.MockedFunction<
  typeof useApplicationStatusHistory
>;
const refetch = jest.fn();
const mockPush = jest.fn();

function mockResult(overrides: Record<string, unknown>) {
  mockedUseHistory.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    refetch,
    ...overrides,
  } as unknown as ReturnType<typeof useApplicationStatusHistory>);
}

function renderTimeline(currentStatus: 'Shortlisted' | 'Interview' | 'Invited' = 'Shortlisted') {
  return render(
    <ApplicationTimeline
      applicationId="app-1"
      appliedDate="2026-09-01T12:00:00Z"
      currentStatus={currentStatus}
    />
  );
}

beforeEach(() => jest.clearAllMocks());

describe('ApplicationTimeline', () => {
  it('fetches history for the given application', () => {
    mockResult({ data: [] });
    renderTimeline();

    expect(mockedUseHistory).toHaveBeenCalledWith('app-1');
  });

  it('shows a loading state', () => {
    mockResult({ isPending: true });
    renderTimeline();

    expect(screen.getByText('Loading timeline…')).toBeInTheDocument();
  });

  it('shows an error state with a working retry', async () => {
    mockResult({ isError: true, error: new Error('boom') });
    renderTimeline();

    expect(
      screen.getByText(/Couldn't load the status timeline/)
    ).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders each status change oldest-first with Current on the last one', () => {
    const events: ApplicationStatusHistoryEvent[] = [
      { fromStatus: null, toStatus: 'Applied', changedAt: '2026-09-01T12:00:00Z' },
      { fromStatus: 'Applied', toStatus: 'Shortlisted', changedAt: '2026-09-03T12:00:00Z' },
      { fromStatus: 'Shortlisted', toStatus: 'Interview', changedAt: '2026-09-05T12:00:00Z' },
    ];
    mockResult({ data: events });
    renderTimeline('Interview');

    expect(screen.getByText('Step 1 · Applied')).toBeInTheDocument();
    expect(screen.getByText('Step 2 · Shortlisted')).toBeInTheDocument();
    expect(screen.getByText('Step 3 · Interview')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('2026-09-01')).toBeInTheDocument();
    expect(screen.getByText('2026-09-05')).toBeInTheDocument();
  });

  it('always starts with the applied date, then appends the live status', () => {
    mockResult({ data: [] });
    renderTimeline();

    expect(screen.getByText('Step 1 · Applied')).toBeInTheDocument();
    expect(screen.getByText('2026-09-01')).toBeInTheDocument();
    expect(screen.getByText(/Step 2 · Shortlisted/)).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('2 steps')).toBeInTheDocument();
    expect(
      screen.queryByText("Earlier status changes aren't recorded for this application yet.")
    ).not.toBeInTheDocument();
  });

  it('skips the duplicate initial Applied record from history', () => {
    mockResult({
      data: [
        { fromStatus: null, toStatus: 'Applied', changedAt: '2026-09-01T12:00:00Z' },
        { fromStatus: 'Applied', toStatus: 'Shortlisted', changedAt: '2026-09-03T12:00:00Z' },
      ],
    });
    renderTimeline();

    expect(screen.getAllByText(/Applied/)).toHaveLength(1);
    expect(screen.getByText('Step 2 · Shortlisted')).toBeInTheDocument();
  });

  it('collapses a consecutive Invited → Interview pair into one dated Interview node', () => {
    mockResult({
      data: [
        { fromStatus: null, toStatus: 'Applied', changedAt: '2026-09-01T12:00:00Z' },
        { fromStatus: 'Applied', toStatus: 'Invited', changedAt: '2026-09-03T12:00:00Z' },
        { fromStatus: 'Invited', toStatus: 'Interview', changedAt: '2026-09-05T12:00:00Z' },
      ],
    });
    renderTimeline('Interview');

    expect(screen.queryByText(/Invited/)).not.toBeInTheDocument();
    expect(screen.getByText('Step 1 · Applied')).toBeInTheDocument();
    expect(screen.getByText('Step 2 · Interview')).toBeInTheDocument();
    expect(screen.getByText('2026-09-03')).toBeInTheDocument();
    expect(screen.queryByText('2026-09-05')).not.toBeInTheDocument();
    expect(screen.getByText('2 steps')).toBeInTheDocument();
  });

  it('merges a recorded Invited with an unrecorded live Interview, keeping the invited date', () => {
    mockResult({
      data: [
        { fromStatus: null, toStatus: 'Applied', changedAt: '2026-09-01T12:00:00Z' },
        { fromStatus: 'Applied', toStatus: 'Invited', changedAt: '2026-09-03T12:00:00Z' },
      ],
    });
    renderTimeline('Interview');

    expect(screen.queryByText(/Invited/)).not.toBeInTheDocument();
    expect(screen.getByText('Step 2 · Interview')).toBeInTheDocument();
    expect(screen.getByText('2026-09-03')).toBeInTheDocument();
    expect(screen.queryByText('Date not recorded')).not.toBeInTheDocument();
  });

  it('keeps Invited visible when it is not followed by Interview', () => {
    mockResult({
      data: [
        { fromStatus: null, toStatus: 'Applied', changedAt: '2026-09-01T12:00:00Z' },
        { fromStatus: 'Applied', toStatus: 'Invited', changedAt: '2026-09-03T12:00:00Z' },
      ],
    });
    renderTimeline('Shortlisted');

    expect(screen.getByText('Step 2 · Invited')).toBeInTheDocument();
    expect(screen.getByText(/Step 3 · Shortlisted/)).toBeInTheDocument();
  });

  it('renders a card header with the step count', () => {
    mockResult({
      data: [
        { fromStatus: null, toStatus: 'Applied', changedAt: '2026-09-01T12:00:00Z' },
        { fromStatus: 'Applied', toStatus: 'Shortlisted', changedAt: '2026-09-03T12:00:00Z' },
      ],
    });
    renderTimeline();

    expect(screen.getByText('Application timeline')).toBeInTheDocument();
    expect(screen.getByText('2 steps')).toBeInTheDocument();
  });

  it('makes the current Invited step clickable to /interviews', async () => {
    mockResult({
      data: [
        { fromStatus: null, toStatus: 'Applied', changedAt: '2026-09-01T12:00:00Z' },
        { fromStatus: 'Applied', toStatus: 'Invited', changedAt: '2026-09-03T12:00:00Z' },
      ],
    });
    renderTimeline('Invited');

    const link = screen.getByRole('button', {
      name: 'View interview invitation',
    });
    expect(link).toBeInTheDocument();
    expect(screen.getByText('View invitation')).toBeInTheDocument();

    await userEvent.click(link);
    expect(mockPush).toHaveBeenCalledWith('/interviews');
  });

  it('does not link the current step when it is not Invited', () => {
    mockResult({ data: [] });
    renderTimeline();

    expect(
      screen.queryByRole('button', { name: 'View interview invitation' })
    ).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
