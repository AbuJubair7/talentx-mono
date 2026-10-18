import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { DeclineInterviewDialog } from '../components/DeclineInterviewDialog'
import { useDeclineInterview } from '../hooks/useDeclineInterview'
import type { TalentInterviewDto } from '../types/interview.types'

jest.mock('../hooks/useDeclineInterview')
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const mockedUseDecline = useDeclineInterview as jest.MockedFunction<typeof useDeclineInterview>
const mutateAsync = jest.fn()

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
    locationOrLink: null,
    instructions: null,
    selectedTimeslotId: null,
    scheduledAt: null,
    sentAt: '2026-03-01T12:00:00Z',
    respondedAt: null,
    timeslots: [],
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mutateAsync.mockResolvedValue({ message: 'Interview invitation declined.' })
  mockedUseDecline.mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useDeclineInterview>)
})

describe('DeclineInterviewDialog', () => {
  it('declines with no reason (reason omitted) when the field is left blank', async () => {
    const onOpenChange = jest.fn()
    render(<DeclineInterviewDialog interview={makeInterview()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: /decline interview/i }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
      invitationId: 'inv-1',
      payload: { reason: undefined },
    }))
    expect(toast.success).toHaveBeenCalledWith('Interview invitation declined.')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('trims and forwards a typed reason', async () => {
    render(<DeclineInterviewDialog interview={makeInterview()} open onOpenChange={jest.fn()} />)

    await userEvent.type(screen.getByPlaceholderText(/accepted another offer/i), '  scheduling conflict  ')
    await userEvent.click(screen.getByRole('button', { name: /decline interview/i }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
      invitationId: 'inv-1',
      payload: { reason: 'scheduling conflict' },
    }))
  })

  it('shows an error toast when the mutation rejects', async () => {
    mutateAsync.mockRejectedValueOnce({ status: 500, message: 'nope' })
    render(<DeclineInterviewDialog interview={makeInterview()} open onOpenChange={jest.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /decline interview/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('nope'))
  })
})
