import { render, screen } from '@testing-library/react'

import { EmployerInterviewTable } from '../components/EmployerInterviewTable'
import type { EmployerInterviewDto } from '../types/interview.types'

function makeInterview(overrides: Partial<EmployerInterviewDto> = {}): EmployerInterviewDto {
  return {
    id: 'int-1',
    jobId: 'job-1',
    jobApplicationId: 'app-1',
    talentUserId: 'user-1',
    applicantName: 'Ada Lovelace',
    applicantEmail: 'ada@example.com',
    type: 'OnlineAssessment',
    status: 'Pending',
    assessmentUrl: null,
    assessmentDeadline: null,
    locationOrLink: null,
    instructions: null,
    declineReason: null,
    selectedTimeslotId: null,
    scheduledAt: null,
    sentAt: '2026-03-01T12:00:00Z',
    respondedAt: null,
    timeslots: [],
    ...overrides,
  }
}

describe('EmployerInterviewTable', () => {
  it('renders the candidate name, email and human-readable type', () => {
    render(<EmployerInterviewTable interviews={[makeInterview()]} isFetching={false} />)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Online Assessment')).toBeInTheDocument()
  })

  it('shows an awaiting-response label when the candidate has not responded', () => {
    render(<EmployerInterviewTable interviews={[makeInterview({ respondedAt: null })]} isFetching={false} />)
    expect(screen.getByText('Awaiting response')).toBeInTheDocument()
  })

  it('shows a cancelled label when the invitation was cancelled without a response', () => {
    render(
      <EmployerInterviewTable
        interviews={[makeInterview({ status: 'Cancelled', respondedAt: null })]}
        isFetching={false}
      />
    )
    expect(screen.getByText('Invitation cancelled')).toBeInTheDocument()
  })

  it('shows the decline reason only for a declined interview', () => {
    render(
      <EmployerInterviewTable
        interviews={[
          makeInterview({
            status: 'Declined',
            respondedAt: '2026-03-02T12:00:00Z',
            declineReason: 'Accepted another offer',
          }),
        ]}
        isFetching={false}
      />
    )
    expect(screen.getByText(/Accepted another offer/)).toBeInTheDocument()
  })

  it('does not render a decline reason when the interview is still pending', () => {
    render(
      <EmployerInterviewTable
        interviews={[makeInterview({ declineReason: 'should be ignored' })]}
        isFetching={false}
      />
    )
    expect(screen.queryByText(/should be ignored/)).not.toBeInTheDocument()
  })

  it('reflects the fetching state via aria-busy for screen readers', () => {
    const { container, rerender } = render(
      <EmployerInterviewTable interviews={[makeInterview()]} isFetching={false} />
    )
    expect(container.querySelector('[aria-busy="false"]')).toBeInTheDocument()

    rerender(<EmployerInterviewTable interviews={[makeInterview()]} isFetching />)
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('renders one row per interview', () => {
    render(
      <EmployerInterviewTable
        interviews={[
          makeInterview({ id: 'a', applicantName: 'Ada' }),
          makeInterview({ id: 'b', applicantName: 'Grace' }),
        ]}
        isFetching={false}
      />
    )
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Grace')).toBeInTheDocument()
  })
})
