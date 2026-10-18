import { render, screen } from '@testing-library/react'
import { EmployerReviewStatusCounts } from '../components/EmployerReviewStatusCounts'

describe('EmployerReviewStatusCounts', () => {
  it('renders a count for every status, including Withdrawn', () => {
    render(
      <EmployerReviewStatusCounts
        counts={{ Pending: 2, Published: 5, Rejected: 1, Hidden: 0, Withdrawn: 3 }}
      />
    )

    expect(screen.getByText('Pending review')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('Hidden')).toBeInTheDocument()
    expect(screen.getByText('Withdrawn')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument();
  })

  it('renders the anonymity/moderation note', () => {
    render(<EmployerReviewStatusCounts counts={{ Pending: 0, Published: 0, Rejected: 0, Hidden: 0, Withdrawn: 0 }} />)

    expect(
      screen.getByText(/reviewers are anonymous\. reviews are moderated by talentx/i)
    ).toBeInTheDocument()
  })
})
