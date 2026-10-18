import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  EmployerReviewsEmpty,
  EmployerReviewsError,
  EmployerReviewsListSkeleton,
} from '../components/EmployerReviewsListStates'

describe('EmployerReviewsListSkeleton', () => {
  it('renders a busy loading region', () => {
    render(<EmployerReviewsListSkeleton />)

    expect(screen.getByLabelText(/loading reviews/i)).toHaveAttribute('aria-busy', 'true')
  })
})

describe('EmployerReviewsEmpty', () => {
  it('shows the unfiltered empty message with no clear-filters button', () => {
    render(<EmployerReviewsEmpty filtered={false} />)

    expect(screen.getByRole('heading', { name: /^no reviews yet$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
  })

  it('shows the filtered empty message with a working clear-filters button', async () => {
    const onClearFilters = jest.fn()
    render(<EmployerReviewsEmpty filtered onClearFilters={onClearFilters} />)

    expect(screen.getByRole('heading', { name: /no reviews match the selected filters/i })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onClearFilters).toHaveBeenCalledTimes(1)
  })
})

describe('EmployerReviewsError', () => {
  it('shows the error description and calls onRetry', async () => {
    const onRetry = jest.fn()
    render(<EmployerReviewsError description="Something went wrong." onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
