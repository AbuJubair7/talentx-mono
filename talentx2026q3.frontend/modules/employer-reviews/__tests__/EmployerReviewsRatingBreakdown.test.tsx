import { render, screen } from '@testing-library/react'
import { EmployerReviewsRatingBreakdown } from '../components/EmployerReviewsRatingBreakdown'
import type { CompanyReviewSummaryDto } from '@/modules/company-review'

const summary: CompanyReviewSummaryDto = {
  totalCount: 2,
  positiveCount: 2,
  negativeCount: 0,
  positivePercent: 100,
  recruitmentProcess: { average: 4.5, ratingCount: 2 },
  communication: { average: null, ratingCount: 0 },
  interviewExperience: { average: 3, ratingCount: 1 },
  professionalism: { average: null, ratingCount: 0 },
}

describe('EmployerReviewsRatingBreakdown', () => {
  it('renders every category label', () => {
    render(<EmployerReviewsRatingBreakdown summary={summary} />)

    expect(screen.getByText('Recruitment Process')).toBeInTheDocument()
    expect(screen.getByText('Communication')).toBeInTheDocument()
    expect(screen.getByText('Interview Experience')).toBeInTheDocument()
    expect(screen.getByText('Professionalism')).toBeInTheDocument()
  })

  it('shows the score and rating count for a rated category', () => {
    render(<EmployerReviewsRatingBreakdown summary={summary} />)

    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('2 ratings')).toBeInTheDocument()
    expect(screen.getByText('3.0')).toBeInTheDocument()
    expect(screen.getByText('1 rating')).toBeInTheDocument()
  })

  it('shows an em dash for a category with no ratings yet', () => {
    render(<EmployerReviewsRatingBreakdown summary={summary} />)

    expect(screen.getAllByText('—')).toHaveLength(2) // communication + professionalism
    expect(screen.getAllByText('0 ratings')).toHaveLength(2)
  })
})
