import { render, screen } from '@testing-library/react'

import { ReviewStatusBadge } from '../components/ReviewStatusBadge'
import { COMPANY_REVIEW_STATUS_VALUES } from '../types/company-review.types'

describe('ReviewStatusBadge', () => {
  it.each([
    ['Pending', 'Pending review'],
    ['Published', 'Published'],
    ['Rejected', 'Rejected'],
    ['Hidden', 'Hidden'],
    ['Withdrawn', 'Withdrawn'],
  ])('labels %s as "%s"', (status, label) => {
    render(<ReviewStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('covers every status the API can return', () => {
    for (const status of COMPANY_REVIEW_STATUS_VALUES) {
      const { unmount } = render(<ReviewStatusBadge status={status} />)
      expect(screen.getByText(/\S/)).toBeInTheDocument()
      unmount()
    }
  })

  it('falls back to the raw value for an unknown status', () => {
    render(<ReviewStatusBadge status="Mystery" />)
    expect(screen.getByText('Mystery')).toBeInTheDocument()
  })
})
