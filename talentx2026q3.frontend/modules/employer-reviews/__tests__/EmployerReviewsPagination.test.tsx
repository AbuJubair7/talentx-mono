import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployerReviewsPagination } from '../components/EmployerReviewsPagination'

describe('EmployerReviewsPagination', () => {
  it('shows the correct "Showing X–Y of Z" range for a middle page', () => {
    render(
      <EmployerReviewsPagination
        page={2}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        isFetching={false}
        onPageChange={jest.fn()}
      />
    )

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 11–20 of 25 reviews')
    expect(screen.getByText(/page 2 of 3/i)).toBeInTheDocument()
  })

  it('uses singular "review" when there is exactly one', () => {
    render(
      <EmployerReviewsPagination
        page={1}
        totalPages={1}
        pageSize={10}
        totalCount={1}
        isFetching={false}
        onPageChange={jest.fn()}
      />
    )

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 1–1 of 1 review')
  })

  it('disables Previous on the first page and Next on the last page', () => {
    const { rerender } = render(
      <EmployerReviewsPagination
        page={1}
        totalPages={2}
        pageSize={10}
        totalCount={15}
        isFetching={false}
        onPageChange={jest.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).toBeEnabled()

    rerender(
      <EmployerReviewsPagination
        page={2}
        totalPages={2}
        pageSize={10}
        totalCount={15}
        isFetching={false}
        onPageChange={jest.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /previous page/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  it('disables both buttons while fetching', () => {
    render(
      <EmployerReviewsPagination
        page={1}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        isFetching
        onPageChange={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
  })

  it('calls onPageChange with the next/previous page number', async () => {
    const onPageChange = jest.fn()
    const user = userEvent.setup()
    render(
      <EmployerReviewsPagination
        page={2}
        totalPages={3}
        pageSize={10}
        totalCount={25}
        isFetching={false}
        onPageChange={onPageChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })
})
