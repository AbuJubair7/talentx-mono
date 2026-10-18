import { render, screen } from '@testing-library/react'

import { makeSummary } from '@/tests/test-utils/company-review-fixtures'

import { CompanyReviewSummaryCard } from '../components/CompanyReviewSummaryCard'

describe('CompanyReviewSummaryCard', () => {
  it('shows an empty state when there are no reviews', () => {
    render(
      <CompanyReviewSummaryCard
        summary={makeSummary({
          totalCount: 0,
          positiveCount: 0,
          negativeCount: 0,
          positivePercent: 0,
          recruitmentProcess: { average: null, ratingCount: 0 },
          communication: { average: null, ratingCount: 0 },
          professionalism: { average: null, ratingCount: 0 },
        })}
      />
    )

    expect(screen.getByText('No reviews yet.')).toBeInTheDocument()
    expect(screen.queryByText(/positive$/)).not.toBeInTheDocument()
  })

  it('shows the percentage, counts and how many reviews it is based on', () => {
    render(<CompanyReviewSummaryCard summary={makeSummary()} />)

    expect(screen.getByText(/66\.7%/)).toBeInTheDocument()
    expect(screen.getByText('Based on 3 reviews')).toBeInTheDocument()
    expect(screen.getByText('2 positive · 1 negative')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '2 positive, 1 negative' })).toBeInTheDocument()
  })

  it('uses the singular for a single review', () => {
    render(
      <CompanyReviewSummaryCard
        summary={makeSummary({ totalCount: 1, positiveCount: 1, negativeCount: 0, positivePercent: 100 })}
      />
    )
    expect(screen.getByText('Based on 1 review')).toBeInTheDocument()
    expect(screen.getByText(/100%/)).toBeInTheDocument()
  })

  it('shows each area average to one decimal, and "Not rated yet" where nobody rated', () => {
    render(<CompanyReviewSummaryCard summary={makeSummary()} />)

    expect(screen.getByText('4.3')).toBeInTheDocument()
    expect(screen.getByText('3.5')).toBeInTheDocument()
    expect(screen.getByText('5.0')).toBeInTheDocument()
    expect(screen.getAllByText('Not rated yet')).toHaveLength(1)
    for (const label of ['Recruitment Process', 'Communication', 'Interview Experience', 'Professionalism']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('renders an all-negative company without a positive share', () => {
    render(
      <CompanyReviewSummaryCard
        summary={makeSummary({ totalCount: 2, positiveCount: 0, negativeCount: 2, positivePercent: 0 })}
      />
    )
    expect(screen.getByText(/^0%/)).toBeInTheDocument()
    expect(screen.getByText('0 positive · 2 negative')).toBeInTheDocument()
  })

  it('shows the optional note and custom title', () => {
    render(
      <CompanyReviewSummaryCard summary={makeSummary()} title="Company reviews" note="Summary reflects published reviews only." />
    )
    expect(screen.getByRole('heading', { name: 'Company reviews' })).toBeInTheDocument()
    expect(screen.getByText('Summary reflects published reviews only.')).toBeInTheDocument()
  })
})
