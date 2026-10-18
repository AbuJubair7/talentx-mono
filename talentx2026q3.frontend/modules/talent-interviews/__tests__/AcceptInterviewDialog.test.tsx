import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { AcceptInterviewDialog } from '../components/AcceptInterviewDialog'
import { useAcceptInterview } from '../hooks/useAcceptInterview'
import type { TalentInterviewDto } from '../types/interview.types'

jest.mock('../hooks/useAcceptInterview')
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const mockedUseAccept = useAcceptInterview as jest.MockedFunction<typeof useAcceptInterview>
const mutateAsync = jest.fn()

function mockMutation(overrides: Record<string, unknown> = {}) {
  mockedUseAccept.mockReturnValue({
    mutateAsync,
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useAcceptInterview>)
}

function makeInterview(overrides: Partial<TalentInterviewDto> = {}): TalentInterviewDto {
  return {
    id: 'inv-1',
    jobId: 'job-1',
    jobApplicationId: 'app-1',
    jobTitle: 'Backend Engineer',
    companyName: 'Acme',
    type: 'OnCall',
    status: 'Pending',
    assessmentUrl: null,
    assessmentDeadline: null,
    locationOrLink: 'https://meet.test/abc',
    instructions: null,
    selectedTimeslotId: null,
    scheduledAt: null,
    sentAt: '2026-03-01T12:00:00Z',
    respondedAt: null,
    timeslots: [],
    ...overrides,
  }
}

const slots = [
  { id: 'slot-1', startTime: '2030-01-01T10:00:00Z', endTime: '2030-01-01T11:00:00Z', isBooked: false, meetingUrl: null },
  { id: 'slot-2', startTime: '2030-01-02T10:00:00Z', endTime: '2030-01-02T11:00:00Z', isBooked: true, meetingUrl: null },
]

beforeEach(() => {
  jest.clearAllMocks()
  mutateAsync.mockResolvedValue({ message: 'Interview invitation accepted.' })
  mockMutation()
})

describe('AcceptInterviewDialog', () => {
  it('accepts immediately (no timeslot) when none are offered', async () => {
    const onOpenChange = jest.fn()
    render(<AcceptInterviewDialog interview={makeInterview()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: /accept interview/i }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
      invitationId: 'inv-1',
      payload: { selectedTimeslotId: undefined },
    }))
    expect(toast.success).toHaveBeenCalledWith('Interview invitation accepted.')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('requires a timeslot choice before the confirm button is enabled', async () => {
    render(<AcceptInterviewDialog interview={makeInterview({ timeslots: slots })} open onOpenChange={jest.fn()} />)

    const confirm = screen.getByRole('button', { name: /accept interview/i })
    expect(confirm).toBeDisabled()
    expect(screen.getByText(/select a timeslot to continue/i)).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('radio')[0])
    expect(confirm).toBeEnabled()
  })

  it('sends the chosen timeslot id in the payload', async () => {
    render(<AcceptInterviewDialog interview={makeInterview({ timeslots: slots })} open onOpenChange={jest.fn()} />)

    await userEvent.click(screen.getAllByRole('radio')[0])
    await userEvent.click(screen.getByRole('button', { name: /accept interview/i }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
      invitationId: 'inv-1',
      payload: { selectedTimeslotId: 'slot-1' },
    }))
  })

  it('disables a booked timeslot that is not the current selection', () => {
    render(<AcceptInterviewDialog interview={makeInterview({ timeslots: slots })} open onOpenChange={jest.fn()} />)
    expect(screen.getAllByRole('radio')[1]).toBeDisabled()
  })

  it('shows an error toast and stays open when the mutation rejects', async () => {
    mutateAsync.mockRejectedValueOnce({ status: 409, message: 'Slot already taken' })
    const onOpenChange = jest.fn()
    render(<AcceptInterviewDialog interview={makeInterview()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: /accept interview/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Slot already taken'))
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('wraps an unbroken-string job title in the dialog description instead of overflowing', () => {
    const longJobTitle = 'a'.repeat(200)
    render(<AcceptInterviewDialog interview={makeInterview({ jobTitle: longJobTitle })} open onOpenChange={jest.fn()} />)

    const description = screen.getByText(new RegExp(longJobTitle))
    expect(description).toHaveClass('break-words')
    // min-w-0 is required alongside break-words: DialogContent is a CSS grid, and without it
    // the grid item's automatic minimum size (based on un-wrapped min-content) lets long text
    // spill past the dialog's own right edge even though break-words is present.
    expect(description).toHaveClass('min-w-0')
  })

  it('closes on Cancel without accepting', async () => {
    const onOpenChange = jest.fn()
    render(<AcceptInterviewDialog interview={makeInterview()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
