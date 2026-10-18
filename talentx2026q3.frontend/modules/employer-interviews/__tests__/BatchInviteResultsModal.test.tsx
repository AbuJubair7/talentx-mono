import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { BatchInviteResultsModal } from '../components/BatchInviteResultsModal';
import { useSendInterviewInvitations } from '../hooks/useSendInterviewInvitations';
import type { SendInterviewBatchPayload, SendInterviewBatchResponse } from '../types/interview.types';

jest.mock('../hooks/useSendInterviewInvitations');
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockedUseSend = useSendInterviewInvitations as jest.MockedFunction<typeof useSendInterviewInvitations>;

const mutateAsync = jest.fn();

function mockMutation(overrides: Record<string, unknown> = {}) {
  mockedUseSend.mockReturnValue({
    mutateAsync,
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useSendInterviewInvitations>);
}

describe('BatchInviteResultsModal', () => {
  beforeEach(() => {
    mockMutation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockResult: SendInterviewBatchResponse = {
    totalProcessed: 2,
    invitedCount: 1,
    skippedCount: 1,
    results: [
      {
        applicationId: 'app-1',
        candidateName: 'Jane Doe',
        candidateEmail: 'jane@example.com',
        success: true,
        invitationId: 'inv-1',
        skipReason: null,
        canForceSend: false,
        hasDanglingPendingInvite: false,
      },
      {
        applicationId: 'app-2',
        candidateName: 'John Smith',
        candidateEmail: 'john@example.com',
        success: false,
        invitationId: null,
        skipReason: 'Candidate already has a pending interview invitation for this position.',
        canForceSend: true,
        hasDanglingPendingInvite: false,
      },
    ],
  };

  const originalPayload: Omit<SendInterviewBatchPayload, 'applicationIds'> = {
    type: 'OnCall',
    locationOrLink: 'https://meet.example.com/room',
  };

  const defaultProps = {
    jobId: 'job-1',
    originalPayload,
    onResultUpdate: jest.fn(),
  };

  /** The confirm dialog's own content, i.e. the most recently opened `[data-slot="dialog-content"]`. */
  function latestDialogContent(): HTMLElement {
    const dialogs = document.querySelectorAll('[data-slot="dialog-content"]');
    return dialogs[dialogs.length - 1] as HTMLElement;
  }

  /** Renders with `result` owned by local state so `onResultUpdate` actually re-renders the row, same as `SendInterviewDialog` owning it for real. */
  function ControlledModal({ initialResult }: { initialResult: SendInterviewBatchResponse }) {
    const [result, setResult] = useState(initialResult);
    return (
      <BatchInviteResultsModal
        open={true}
        onOpenChange={jest.fn()}
        result={result}
        jobId="job-1"
        originalPayload={originalPayload}
        onResultUpdate={setResult}
      />
    );
  }

  it('renders invitation summary counters and candidate details with skip reasons', () => {
    const onOpenChange = jest.fn();
    render(
      <BatchInviteResultsModal open={true} onOpenChange={onOpenChange} result={mockResult} {...defaultProps} />,
    );

    expect(screen.getByText('Interview Invitation Results')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('Candidate already has a pending interview invitation for this position.')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Close is clicked', async () => {
    const onOpenChange = jest.fn();
    render(
      <BatchInviteResultsModal open={true} onOpenChange={onOpenChange} result={mockResult} {...defaultProps} />,
    );

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await userEvent.click(closeButtons[0]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('only renders "Send Anyway" for the row where canForceSend is true', () => {
    render(
      <BatchInviteResultsModal open={true} onOpenChange={jest.fn()} result={mockResult} {...defaultProps} />,
    );

    expect(screen.getAllByRole('button', { name: 'Send Anyway' })).toHaveLength(1);
  });

  it('opens the confirm dialog when "Send Anyway" is clicked', async () => {
    render(
      <BatchInviteResultsModal open={true} onOpenChange={jest.fn()} result={mockResult} {...defaultProps} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Send Anyway' }));

    expect(await screen.findByText('Send Invitation Anyway')).toBeInTheDocument();
    expect(
      screen.getByText("This will cancel John Smith's existing pending interview invitation and send a new one."),
    ).toBeInTheDocument();
  });

  it('confirming calls the mutation with force: true and only the target applicationId', async () => {
    mutateAsync.mockResolvedValueOnce({
      totalProcessed: 1,
      invitedCount: 1,
      skippedCount: 0,
      results: [
        {
          applicationId: 'app-2',
          candidateName: 'John Smith',
          candidateEmail: 'john@example.com',
          success: true,
          invitationId: 'inv-2',
          skipReason: null,
          canForceSend: false,
          hasDanglingPendingInvite: false,
        },
      ],
    });

    render(<ControlledModal initialResult={mockResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Send Anyway' }));
    const confirmButton = within(latestDialogContent()).getByRole('button', { name: 'Send Invitation' });
    await userEvent.click(confirmButton);

    expect(mutateAsync).toHaveBeenCalledWith({
      applicationIds: ['app-2'],
      ...originalPayload,
      force: true,
    });
  });

  it('updates the row to "Invited" after a successful force-send response', async () => {
    mutateAsync.mockResolvedValueOnce({
      totalProcessed: 1,
      invitedCount: 1,
      skippedCount: 0,
      results: [
        {
          applicationId: 'app-2',
          candidateName: 'John Smith',
          candidateEmail: 'john@example.com',
          success: true,
          invitationId: 'inv-2',
          skipReason: null,
          canForceSend: false,
          hasDanglingPendingInvite: false,
        },
      ],
    });

    render(<ControlledModal initialResult={mockResult} />);

    await userEvent.click(screen.getByRole('button', { name: 'Send Anyway' }));
    const confirmButton = within(latestDialogContent()).getByRole('button', { name: 'Send Invitation' });
    await userEvent.click(confirmButton);

    const johnSmithRow = (await screen.findByText('John Smith')).closest('div.p-3') as HTMLElement;
    expect(within(johnSmithRow).getByText('Invited')).toBeInTheDocument();
    expect(within(johnSmithRow).queryByRole('button', { name: 'Send Anyway' })).not.toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Invitation sent to John Smith.');
  });
});
