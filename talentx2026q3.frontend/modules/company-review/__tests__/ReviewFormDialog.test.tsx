import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'

import { makeReview, makeReviewItem } from '@/tests/test-utils/company-review-fixtures'

import { ReviewFormDialog } from '../components/ReviewFormDialog'
import { useSubmitCompanyReview } from '../hooks/useSubmitCompanyReview'
import { useUpdateCompanyReview } from '../hooks/useUpdateCompanyReview'

jest.mock('../hooks/useSubmitCompanyReview')
jest.mock('../hooks/useUpdateCompanyReview')
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const mockedUseSubmit = useSubmitCompanyReview as jest.MockedFunction<typeof useSubmitCompanyReview>
const mockedUseUpdate = useUpdateCompanyReview as jest.MockedFunction<typeof useUpdateCompanyReview>
const submitAsync = jest.fn()
const updateAsync = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  submitAsync.mockResolvedValue('new-id')
  updateAsync.mockResolvedValue({ message: 'Review updated and sent for moderation.' })
  mockedUseSubmit.mockReturnValue({ mutateAsync: submitAsync, isPending: false } as unknown as ReturnType<typeof useSubmitCompanyReview>)
  mockedUseUpdate.mockReturnValue({ mutateAsync: updateAsync, isPending: false } as unknown as ReturnType<typeof useUpdateCompanyReview>)
})

describe('ReviewFormDialog (new review)', () => {
  it('shows the create title, the job and company, and an optional-ratings section', () => {
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={jest.fn()} />)

    expect(screen.getByText('Review this company')).toBeInTheDocument()
    expect(screen.getByText(/Backend Engineer/)).toBeInTheDocument()
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit review' })).toBeInTheDocument()
    expect(screen.queryByText(/sends the review back for moderation/i)).not.toBeInTheDocument()
  })

  it('blocks submitting without a sentiment and explains why', async () => {
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={jest.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    expect(await screen.findByText('Please choose Positive or Negative.')).toBeInTheDocument()
    expect(submitAsync).not.toHaveBeenCalled()
  })

  it('submits just a sentiment: no comment, every rating null', async () => {
    const onOpenChange = jest.fn()
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Positive' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await waitFor(() =>
      expect(submitAsync).toHaveBeenCalledWith({
        jobApplicationId: 'app-1',
        sentiment: 'Positive',
        comment: undefined,
        ratings: { recruitmentProcess: null, communication: null, interviewExperience: null, professionalism: null },
      })
    )
    expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/awaiting moderation/i))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('submits a trimmed comment and the ratings that were chosen', async () => {
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={jest.fn()} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Negative' }))
    await userEvent.type(screen.getByLabelText(/written feedback/i), '  Slow to reply.  ')
    await userEvent.click(within(screen.getByRole('group', { name: 'Communication' })).getByRole('button', { name: 'Rate 2 out of 5' }))
    await userEvent.click(within(screen.getByRole('group', { name: 'Professionalism' })).getByRole('button', { name: 'Rate 5 out of 5' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await waitFor(() =>
      expect(submitAsync).toHaveBeenCalledWith({
        jobApplicationId: 'app-1',
        sentiment: 'Negative',
        comment: 'Slow to reply.',
        ratings: { recruitmentProcess: null, communication: 2, interviewExperience: null, professionalism: 5 },
      })
    )
  })

  it('lets a chosen rating be cleared back to "not rated"', async () => {
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={jest.fn()} />)

    const group = () => screen.getByRole('group', { name: 'Communication' })
    await userEvent.click(within(group()).getByRole('button', { name: 'Rate 4 out of 5' }))
    await userEvent.click(within(group()).getByRole('button', { name: 'Clear' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Positive' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await waitFor(() =>
      expect(submitAsync).toHaveBeenCalledWith(
        expect.objectContaining({ ratings: expect.objectContaining({ communication: null }) })
      )
    )
  })

  it('counts characters and flags a comment that is too long', async () => {
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={jest.fn()} />)
    expect(screen.getByText('0/2000')).toBeInTheDocument()

    const comment = screen.getByLabelText(/written feedback/i)
    await userEvent.click(comment)
    await userEvent.paste('a'.repeat(2001))
    await userEvent.click(screen.getByRole('radio', { name: 'Positive' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    expect(screen.getByText('2001/2000')).toBeInTheDocument()
    expect(await screen.findByText('Feedback must not exceed 2000 characters.')).toBeInTheDocument()
    expect(submitAsync).not.toHaveBeenCalled()
  })

  it("shows the API's message in an error toast and stays open when submit fails", async () => {
    submitAsync.mockRejectedValueOnce({ status: 409, message: 'You have already reviewed the company for this application.' })
    const onOpenChange = jest.fn()
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Positive' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('You have already reviewed the company for this application.')
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('closes on Cancel without submitting', async () => {
    const onOpenChange = jest.fn()
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(submitAsync).not.toHaveBeenCalled()
  })

  it('disables the buttons and shows progress while saving', () => {
    mockedUseSubmit.mockReturnValue({ mutateAsync: submitAsync, isPending: true } as unknown as ReturnType<typeof useSubmitCompanyReview>)
    render(<ReviewFormDialog item={makeReviewItem()} open onOpenChange={jest.fn()} />)

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })
})

describe('ReviewFormDialog (edit)', () => {
  const editItem = () =>
    makeReviewItem({
      review: makeReview({ sentiment: 'Positive', comment: 'Original.', ratings: { recruitmentProcess: 5, communication: null, interviewExperience: null, professionalism: null } }),
      canEdit: true,
      canWithdraw: true,
      canSubmit: false,
    })

  it('shows the edit title, the moderation warning and the saved values', () => {
    render(<ReviewFormDialog item={editItem()} open onOpenChange={jest.fn()} />)

    expect(screen.getByText('Edit your review')).toBeInTheDocument()
    expect(screen.getByText(/sends the review back for moderation/i)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Positive' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText(/written feedback/i)).toHaveValue('Original.')
    expect(
      within(screen.getByRole('group', { name: 'Recruitment Process' })).getByRole('button', { name: 'Rate 5 out of 5' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('updates the existing review instead of creating a new one', async () => {
    const onOpenChange = jest.fn()
    render(<ReviewFormDialog item={editItem()} open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Negative' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(updateAsync).toHaveBeenCalledWith({
        reviewId: 'review-1',
        payload: {
          sentiment: 'Negative',
          comment: 'Original.',
          ratings: { recruitmentProcess: 5, communication: null, interviewExperience: null, professionalism: null },
        },
      })
    )
    expect(submitAsync).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Review updated and sent for moderation.')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows an error toast when the update fails', async () => {
    updateAsync.mockRejectedValueOnce({ status: 400, message: 'This review was hidden by a moderator and can no longer be edited.' })
    render(<ReviewFormDialog item={editItem()} open onOpenChange={jest.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('This review was hidden by a moderator and can no longer be edited.')
    )
  })
})
