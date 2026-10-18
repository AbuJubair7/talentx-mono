import { render, screen } from '@testing-library/react'
import { EmployerReviewsSummaryCards } from '../components/EmployerReviewsSummaryCards'
import type { EmployerCompanyReviewSummaryDto } from '../types/employer-reviews.types'

function makeData(overrides: Partial<EmployerCompanyReviewSummaryDto['summary']> = {}): EmployerCompanyReviewSummaryDto {
  return {
    summary: {
      totalCount: 0,
      positiveCount: 0,
      negativeCount: 0,
      positivePercent: 0,
      recruitmentProcess: { average: null, ratingCount: 0 },
      communication: { average: null, ratingCount: 0 },
      interviewExperience: { average: null, ratingCount: 0 },
      professionalism: { average: null, ratingCount: 0 },
      ...overrides,
    },
    countsByStatus: { Pending: 0, Published: 0, Rejected: 0, Hidden: 0, Withdrawn: 0 },
  }
}

describe('EmployerReviewsSummaryCards', () => {
  it('shows em dashes when there are no published reviews yet', () => {
    render(<EmployerReviewsSummaryCards data={makeData()} totalSubmitted={0} />)

    expect(screen.getAllByText('—')).toHaveLength(2) // overall rating + positive sentiment
    expect(screen.getAllByText('0')).toHaveLength(2) // published reviews count + pending count
  })

  it('shows the overall rating, published count, positive percent and pending count', () => {
    const data = makeData({
      totalCount: 4,
      positiveCount: 3,
      negativeCount: 1,
      positivePercent: 75,
      recruitmentProcess: { average: 5, ratingCount: 4 },
      communication: { average: 3, ratingCount: 4 },
    })
    render(<EmployerReviewsSummaryCards data={{ ...data, countsByStatus: { ...data.countsByStatus, Pending: 2 } }} totalSubmitted={6} />)

    expect(screen.getByText('4.0')).toBeInTheDocument() // (5+3)/2
    expect(screen.getByText('4')).toBeInTheDocument() // published reviews
    expect(screen.getByText('of 6 submitted · visible to candidates')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('3 positive · 1 negative')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // pending
    expect(screen.getByText('Being reviewed by TalentX')).toBeInTheDocument()
  })

  it('shows "Nothing in the queue" when there is nothing pending', () => {
    render(<EmployerReviewsSummaryCards data={makeData()} totalSubmitted={0} />)

    expect(screen.getByText('Nothing in the queue')).toBeInTheDocument()
  })
})
