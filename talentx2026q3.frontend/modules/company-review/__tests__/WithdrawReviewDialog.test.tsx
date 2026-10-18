import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { makeReview, makeReviewItem } from '@/tests/test-utils/company-review-fixtures'

import { WithdrawReviewDialog } from '../components/WithdrawReviewDialog'
import { useWithdrawCompanyReview } from '../hooks/useWithdrawCompanyReview'

jest.mock('../hooks/useWithdrawCompanyReview')
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const mockedUseWithdraw = useWithdrawCompanyReview as jest.MockedFunction<typeof useWithdrawCompanyReview>
const mutateAsync = jest.fn()

const item = () => makeReviewItem({ review: makeReview(), canEdit: true, canWithdraw: true, canSubmit: false })

beforeEach(() => {
  jest.clearAllMocks()
  mutateAsync.mockResolvedValue({ message: 'Review withdrawn.' })
  mockedUseWithdraw.mockReturnValue({ mutateAsync, isPending: false } as unknown as ReturnType<typeof useWithdrawCompanyReview>)
})

describe('WithdrawReviewDialog', () => {
  it('warns that withdrawing is final', () => {
    render(<WithdrawReviewDialog item={item()} open onOpenChange={jest.fn()} />)

    expect(screen.getByText(/this is final/i)).toBeInTheDocument()
    expect(screen.getByText(/can.t review this application again/i)).toBeInTheDocument()
  })

  it('withdraws the review, confirms with a toast and closes', async () => {
    const onOpenChange = jest.fn()
    render(<WithdrawReviewDialog item={item()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Withdraw review' }))

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith('review-1'))
    expect(toast.success).toHaveBeenCalledWith('Review withdrawn.')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does nothing when there is no review to withdraw', async () => {
    render(<WithdrawReviewDialog item={makeReviewItem({ review: null })} open onOpenChange={jest.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Withdraw review' }))

    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it("shows the API's message and stays open when withdrawing fails", async () => {
    mutateAsync.mockRejectedValueOnce({ status: 400, message: 'This review has already been withdrawn.' })
    const onOpenChange = jest.fn()
    render(<WithdrawReviewDialog item={item()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Withdraw review' }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('This review has already been withdrawn.'))
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('closes on Cancel without withdrawing', async () => {
    const onOpenChange = jest.fn()
    render(<WithdrawReviewDialog item={item()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
