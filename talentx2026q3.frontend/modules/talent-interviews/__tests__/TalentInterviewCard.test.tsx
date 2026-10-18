import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TalentInterviewCard } from '../components/TalentInterviewCard'
import type { TalentInterviewDto } from '../types/interview.types'

// The Accept/Decline dialogs pull in react-query hooks; stub them to lightweight
// markers so this test can focus on the card itself.
jest.mock('../components/AcceptInterviewDialog', () => ({
  AcceptInterviewDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="accept-dialog" /> : null,
}))
jest.mock('../components/DeclineInterviewDialog', () => ({
  DeclineInterviewDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="decline-dialog" /> : null,
}))

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

describe('TalentInterviewCard', () => {
  it('renders the job title, company and type label', () => {
    render(<TalentInterviewCard interview={makeInterview()} />)
    expect(screen.getByRole('heading', { name: 'Backend Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('On Call')).toBeInTheDocument()
  })

  it('shows Accept / Decline actions only while pending', () => {
    const { rerender } = render(<TalentInterviewCard interview={makeInterview({ status: 'Pending' })} />)
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument()

    rerender(<TalentInterviewCard interview={makeInterview({ status: 'Declined' })} />)
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument()
  })

  it('opens the accept dialog when Accept is clicked', async () => {
    render(<TalentInterviewCard interview={makeInterview()} />)
    expect(screen.queryByTestId('accept-dialog')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Accept' }))
    expect(screen.getByTestId('accept-dialog')).toBeInTheDocument()
  })

  it('renders instructions when present', () => {
    render(<TalentInterviewCard interview={makeInterview({ instructions: 'Bring your laptop' })} />)
    expect(screen.getByText('Bring your laptop')).toBeInTheDocument()
  })

  it('wraps an unbroken-string job title, company name, and instructions instead of overflowing', () => {
    const longJobTitle = 'a'.repeat(200)
    const longCompanyName = 'b'.repeat(200)
    const longInstructions = 'c'.repeat(200)
    render(
      <TalentInterviewCard
        interview={makeInterview({
          jobTitle: longJobTitle,
          companyName: longCompanyName,
          instructions: longInstructions,
        })}
      />
    )

    const heading = screen.getByRole('heading', { name: longJobTitle })
    expect(heading).toHaveClass('break-words')
    expect(heading).toHaveClass('[overflow-wrap:anywhere]')
    expect(heading).toHaveAttribute('title', longJobTitle)

    expect(screen.getByText(longCompanyName)).toHaveClass('break-words')
    expect(screen.getByText(longInstructions)).toHaveClass('break-words')
  })

  it('shows the schedule/location panel for an accepted interview', () => {
    render(
      <TalentInterviewCard
        interview={makeInterview({
          status: 'Accepted',
          scheduledAt: '2030-01-01T10:00:00Z',
          locationOrLink: 'https://meet.test/room',
        })}
      />
    )
    expect(screen.getByText('https://meet.test/room')).toBeInTheDocument()
  })

  describe('once the invitation has expired', () => {
    it('hides both Accept and Decline for an OnlineAssessment past its deadline', () => {
      render(
        <TalentInterviewCard
          interview={makeInterview({
            type: 'OnlineAssessment',
            assessmentDeadline: '2020-01-01T00:00:00Z',
          })}
          now={new Date('2026-01-01T00:00:00Z')}
        />
      )
      expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Decline' })).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/expired/i)
    })

    it('keeps both actions available right up until the OnlineAssessment deadline passes', () => {
      render(
        <TalentInterviewCard
          interview={makeInterview({
            type: 'OnlineAssessment',
            assessmentDeadline: '2026-01-02T00:00:00Z',
          })}
          now={new Date('2026-01-01T00:00:00Z')}
        />
      )
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument()
    })

    it('keeps both actions available for OnCall/OnSite while at least one offered timeslot is still in the future', () => {
      render(
        <TalentInterviewCard
          interview={makeInterview({
            type: 'OnCall',
            timeslots: [
              { id: 't1', startTime: '2020-01-01T09:00:00Z', endTime: '2020-01-01T09:30:00Z', isBooked: false, meetingUrl: null },
              { id: 't2', startTime: '2026-01-05T09:00:00Z', endTime: '2026-01-05T09:30:00Z', isBooked: false, meetingUrl: null },
            ],
          })}
          now={new Date('2026-01-01T00:00:00Z')}
        />
      )
      expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Decline' })).toBeInTheDocument()
    })

    it('hides both actions for OnCall/OnSite once every offered timeslot has passed', () => {
      render(
        <TalentInterviewCard
          interview={makeInterview({
            type: 'OnCall',
            timeslots: [
              { id: 't1', startTime: '2020-01-01T09:00:00Z', endTime: '2020-01-01T09:30:00Z', isBooked: false, meetingUrl: null },
              { id: 't2', startTime: '2020-01-02T09:00:00Z', endTime: '2020-01-02T09:30:00Z', isBooked: false, meetingUrl: null },
            ],
          })}
          now={new Date('2026-01-01T00:00:00Z')}
        />
      )
      expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Decline' })).not.toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/expired/i)
    })
  })
})
