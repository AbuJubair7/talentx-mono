import { render, screen } from '@testing-library/react'
import { EmployerReviewCard } from '../components/EmployerReviewCard'
import type { EmployerCompanyReviewDto } from '../types/employer-reviews.types'

const review: EmployerCompanyReviewDto = {
  id: 'review-1',
  status: 'Hidden',
  sentiment: 'Negative',
  comment: 'The process took too long.',
  ratings: { recruitmentProcess: 2, communication: null, interviewExperience: null, professionalism: null },
  jobTitle: 'Product Designer',
  submittedAt: '2026-02-01T00:00:00.000Z',
  updatedAt: null,
}

describe('EmployerReviewCard', () => {
  it('renders the job title, comment and status badge', () => {
    render(<EmployerReviewCard review={review} />)

    expect(screen.getByText(/applied for/i)).toHaveTextContent('Product Designer')
    expect(screen.getByText(/the process took too long/i)).toBeInTheDocument()
    expect(screen.getByText('Hidden')).toBeInTheDocument()
  })

  it('never renders any reviewer-identifying text (name, email, ids)', () => {
    render(<EmployerReviewCard review={review} />)

    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
    expect(screen.queryByText(review.id)).not.toBeInTheDocument()
  })

  it('renders no interactive buttons — the employer can only read', () => {
    render(<EmployerReviewCard review={review} />)

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  })

  it('shows only the rated categories, with the correct overall average', () => {
    render(<EmployerReviewCard review={review} />)

    expect(screen.getByText('Recruitment Process')).toBeInTheDocument()
    expect(screen.queryByText('Communication')).not.toBeInTheDocument()
    expect(screen.queryByText('Interview Experience')).not.toBeInTheDocument()
    expect(screen.queryByText('Professionalism')).not.toBeInTheDocument()
    expect(screen.getByText('2.0')).toBeInTheDocument()
  })

  it('shows an em dash instead of a score when nothing was rated', () => {
    render(<EmployerReviewCard review={{ ...review, ratings: { recruitmentProcess: null, communication: null, interviewExperience: null, professionalism: null } }} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows an "Updated" timestamp only when the review has been updated', () => {
    const { rerender } = render(<EmployerReviewCard review={review} />)
    expect(screen.queryByText(/^Updated/)).not.toBeInTheDocument()

    rerender(<EmployerReviewCard review={{ ...review, updatedAt: '2026-02-02T00:00:00.000Z' }} />)
    expect(screen.getByText(/^Updated/)).toBeInTheDocument()
  })

  it('truncates an unbroken-string job title and wraps an unbroken-string comment instead of overflowing', () => {
    const longJobTitle = 'a'.repeat(200)
    const longComment = 'b'.repeat(200)
    render(<EmployerReviewCard review={{ ...review, jobTitle: longJobTitle, comment: longComment }} />)

    expect(screen.getByText(new RegExp(longJobTitle))).toHaveClass('truncate')
    expect(screen.getByText(longComment)).toHaveClass('break-words')
  })
})
