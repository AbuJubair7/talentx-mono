import { render, screen } from '@testing-library/react'

import { InterviewStatusBadge } from '../components/InterviewStatusBadge'

describe('InterviewStatusBadge', () => {
  it('renders the configured label for a known status (case-insensitive)', () => {
    render(<InterviewStatusBadge status="Accepted" />)
    expect(screen.getByText('Accepted')).toBeInTheDocument()
  })

  it('falls back to the raw status text when unknown', () => {
    render(<InterviewStatusBadge status="Rescheduled" />)
    expect(screen.getByText('Rescheduled')).toBeInTheDocument()
  })

  it('renders a decorative status dot that is hidden from assistive tech', () => {
    const { container } = render(<InterviewStatusBadge status="Pending" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})
