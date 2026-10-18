import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { SendInterviewDialog } from '../components/SendInterviewDialog'
import { useSendInterviewInvitations } from '../hooks/useSendInterviewInvitations'

jest.mock('../hooks/useSendInterviewInvitations')
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn() },
}))

const mockedUseSend = useSendInterviewInvitations as jest.MockedFunction<typeof useSendInterviewInvitations>

const mutateAsync = jest.fn()

function mockMutation(overrides: Record<string, unknown> = {}) {
  mockedUseSend.mockReturnValue({
    mutateAsync,
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useSendInterviewInvitations>)
}

function renderDialog(props: Partial<React.ComponentProps<typeof SendInterviewDialog>> = {}) {
  const onOpenChange = jest.fn()
  const onSent = jest.fn()
  render(
    <SendInterviewDialog
      jobId="job-1"
      applicationIds={['app-1']}
      open
      onOpenChange={onOpenChange}
      onSent={onSent}
      {...props}
    />
  )
  return { onOpenChange, onSent }
}

/** The datetime-local field has no accessible name; grab it directly from the portal. */
function deadlineInput() {
  return document.querySelector('input[type="datetime-local"]') as HTMLInputElement
}

function futureLocal(daysFromNow: number) {
  return new Date(Date.now() + daysFromNow * 86_400_000).toISOString().slice(0, 16)
}

beforeEach(() => {
  jest.clearAllMocks()
  mutateAsync.mockResolvedValue({
    totalProcessed: 1,
    invitedCount: 1,
    skippedCount: 0,
    results: [
      { applicationId: 'app-1', candidateName: 'Alex Smith', candidateEmail: 'alex@example.com', success: true },
    ],
  })
  mockMutation()
})

describe('SendInterviewDialog', () => {
  it('renders the title and a candidate count in the description', () => {
    renderDialog({ applicationIds: ['app-1', 'app-2'] })
    expect(screen.getByRole('heading', { name: /invite to interview/i })).toBeInTheDocument()
    expect(screen.getByText(/2 candidates/i)).toBeInTheDocument()
  })

  it('defaults to the Online Assessment fields', () => {
    renderDialog()
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument()
    expect(deadlineInput()).toBeInTheDocument()
  })

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }))

    expect(await screen.findByText('Assessment URL is required for an online assessment.')).toBeInTheDocument()
    expect(screen.getByText('A deadline is required for an online assessment.')).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('submits only the fields relevant to the chosen type and reports success', async () => {
    const { onSent, onOpenChange } = renderDialog()

    await userEvent.type(screen.getByPlaceholderText('https://...'), '  https://hackerrank.test/x  ')
    await userEvent.type(deadlineInput(), futureLocal(3))
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
    const payload = mutateAsync.mock.calls[0][0]
    expect(payload).toMatchObject({
      applicationIds: ['app-1'],
      type: 'OnlineAssessment',
      assessmentUrl: 'https://hackerrank.test/x',
      locationOrLink: undefined,
      timeslots: undefined,
    })
    expect(typeof payload.assessmentDeadline).toBe('string')
    expect(payload.assessmentDeadline).toMatch(/\dT.*Z$/) // ISO, not the raw datetime-local value

    expect(onSent).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(await screen.findByRole('heading', { name: /interview invitation results/i })).toBeInTheDocument()
  })

  it('renders results modal with skipped candidate details when fewer candidates are invited', async () => {
    mutateAsync.mockResolvedValue({
      totalProcessed: 2,
      invitedCount: 1,
      skippedCount: 1,
      results: [
        { applicationId: 'app-1', candidateName: 'Alex', candidateEmail: 'alex@example.com', success: true },
        { applicationId: 'app-2', candidateName: 'Sam', candidateEmail: 'sam@example.com', success: false, skipReason: 'Already has pending invite' },
      ],
    })
    renderDialog({ applicationIds: ['app-1', 'app-2'] })

    await userEvent.type(screen.getByPlaceholderText('https://...'), 'https://hackerrank.test/x')
    await userEvent.type(deadlineInput(), futureLocal(3))
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }))

    expect(await screen.findByRole('heading', { name: /interview invitation results/i })).toBeInTheDocument()
    expect(screen.getByText('Already has pending invite')).toBeInTheDocument()
  })

  it('forwards the submitted payload (minus applicationIds) to BatchInviteResultsModal as originalPayload for the force-send', async () => {
    mutateAsync.mockResolvedValueOnce({
      totalProcessed: 2,
      invitedCount: 1,
      skippedCount: 1,
      results: [
        { applicationId: 'app-1', candidateName: 'Alex', candidateEmail: 'alex@example.com', success: true, canForceSend: false, hasDanglingPendingInvite: false },
        {
          applicationId: 'app-2',
          candidateName: 'Sam',
          candidateEmail: 'sam@example.com',
          success: false,
          skipReason: 'Candidate already has a pending interview invitation for this position.',
          canForceSend: true,
          hasDanglingPendingInvite: false,
        },
      ],
    })
    renderDialog({ applicationIds: ['app-1', 'app-2'] })

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'On Call' }))
    await userEvent.type(screen.getByPlaceholderText('https://meet...'), 'https://meet.example.com/room')
    await userEvent.click(screen.getByRole('button', { name: /add timeslot/i }))
    await userEvent.click(screen.getByRole('button', { name: /add timeslot/i }))
    const [slot1Start, slot1End, slot2Start, slot2End] = document.querySelectorAll('input[type="datetime-local"]')
    await userEvent.type(slot1Start, futureLocal(3))
    await userEvent.type(slot1End, futureLocal(4))
    await userEvent.type(slot2Start, futureLocal(5))
    await userEvent.type(slot2End, futureLocal(6))
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }))

    expect(await screen.findByRole('heading', { name: /interview invitation results/i })).toBeInTheDocument()
    const { applicationIds, ...firstPayload } = mutateAsync.mock.calls[0][0]
    void applicationIds

    mutateAsync.mockResolvedValueOnce({
      totalProcessed: 1,
      invitedCount: 1,
      skippedCount: 0,
      results: [
        { applicationId: 'app-2', candidateName: 'Sam', candidateEmail: 'sam@example.com', success: true, canForceSend: false, hasDanglingPendingInvite: false },
      ],
    })

    await userEvent.click(screen.getByRole('button', { name: 'Send Anyway' }))
    const dialogs = document.querySelectorAll('[data-slot="dialog-content"]')
    const confirmDialog = dialogs[dialogs.length - 1] as HTMLElement
    await userEvent.click(within(confirmDialog).getByRole('button', { name: 'Send Invitation' }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))
    expect(mutateAsync).toHaveBeenLastCalledWith({
      applicationIds: ['app-2'],
      ...firstPayload,
      force: true,
    })
  })

  it('shows an error toast when the mutation rejects', async () => {
    mutateAsync.mockRejectedValueOnce({ status: 500, message: 'server exploded' })
    renderDialog()

    await userEvent.type(screen.getByPlaceholderText('https://...'), 'https://hackerrank.test/x')
    await userEvent.type(deadlineInput(), futureLocal(3))
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('server exploded'))
  })

  it('closes without submitting when Cancel is clicked', async () => {
    const { onOpenChange } = renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('disables the submit button while a send is pending', () => {
    mockMutation({ isPending: true })
    renderDialog()
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
  })

  it('marks Assessment URL and Deadline as required, leaves Instructions unmarked', () => {
    renderDialog()
    expect(screen.getByText('Assessment URL')).toHaveTextContent('*')
    expect(screen.getByText('Deadline')).toHaveTextContent('*')
    expect(screen.getByText(/instructions/i)).not.toHaveTextContent('*')
  })

  it('marks the location label as required after switching to On Call', async () => {
    renderDialog()
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: 'On Call' }))

    expect(screen.getByText('Meeting link')).toHaveTextContent('*')
  })
})
