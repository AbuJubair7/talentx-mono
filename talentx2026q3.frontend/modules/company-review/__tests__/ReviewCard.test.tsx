import { render, screen } from '@testing-library/react'

import { ReviewCard } from '../components/ReviewCard'

const ratings = { recruitmentProcess: 5, communication: null, interviewExperience: 3, professionalism: null }

describe('ReviewCard', () => {
  it('shows the sentiment, comment and only the areas that were rated', () => {
    render(<ReviewCard sentiment="Positive" comment="Well organised." ratings={ratings} />)

    expect(screen.getByText('Positive')).toBeInTheDocument()
    expect(screen.getByText('Well organised.')).toBeInTheDocument()
    expect(screen.getByText('Recruitment Process')).toBeInTheDocument()
    expect(screen.getByText('Interview Experience')).toBeInTheDocument()
    expect(screen.queryByText('Communication')).not.toBeInTheDocument()
    expect(screen.queryByText('Professionalism')).not.toBeInTheDocument()
  })

  it('shows a negative sentiment', () => {
    render(<ReviewCard sentiment="Negative" comment={null} ratings={ratings} />)
    expect(screen.getByText('Negative')).toBeInTheDocument()
  })

  it('omits the ratings list when nothing was rated', () => {
    render(
      <ReviewCard
        sentiment="Positive"
        comment="Fine."
        ratings={{ recruitmentProcess: null, communication: null, interviewExperience: null, professionalism: null }}
      />
    )
    expect(screen.queryByRole('term')).not.toBeInTheDocument()
  })

  it('omits the comment when there is none', () => {
    const { container } = render(<ReviewCard sentiment="Positive" comment={null} ratings={ratings} />)
    expect(container.querySelector('p')).toBeNull()
  })

  it('shows job title and status only when asked to', () => {
    const { rerender } = render(<ReviewCard sentiment="Positive" comment="x" ratings={ratings} />)
    expect(screen.queryByText('Backend Engineer')).not.toBeInTheDocument()
    expect(screen.queryByText('Published')).not.toBeInTheDocument()

    rerender(<ReviewCard sentiment="Positive" comment="x" ratings={ratings} jobTitle="Backend Engineer" status="Published" />)
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('formats the date as month + year for public use', () => {
    render(<ReviewCard sentiment="Positive" comment="x" ratings={ratings} date="2026-09-20T10:00:00Z" dateStyle="monthYear" />)
    expect(screen.getByText('Sep 2026')).toBeInTheDocument()
  })

  it('formats the date in full by default', () => {
    render(<ReviewCard sentiment="Positive" comment="x" ratings={ratings} date="2026-09-20T10:00:00Z" />)
    expect(screen.getByText(/Sep 20, 2026/)).toBeInTheDocument()
  })

  it('wraps an unbroken-string job title and comment instead of overflowing', () => {
    const longJobTitle = 'a'.repeat(200)
    const longComment = 'b'.repeat(200)
    render(<ReviewCard sentiment="Positive" comment={longComment} ratings={ratings} jobTitle={longJobTitle} />)

    expect(screen.getByText(longJobTitle)).toHaveClass('break-words')
    expect(screen.getByText(longComment)).toHaveClass('break-words')
  })
})
