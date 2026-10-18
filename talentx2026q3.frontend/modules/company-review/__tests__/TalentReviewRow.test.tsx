import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeReview, makeReviewItem } from '@/tests/test-utils/company-review-fixtures'
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { TalentReviewRow } from '../components/TalentReviewRow'
import type { MyCompanyReviewItemDto } from '../types/company-review.types'

function renderRow(item: MyCompanyReviewItemDto) {
  return render(<TalentReviewRow item={item} />, { wrapper: createQueryWrapper() })
}

describe('TalentReviewRow', () => {
  it('shows the company, job and interview type', () => {
    renderRow(makeReviewItem())

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument()
    expect(screen.getByText('On Call')).toBeInTheDocument()
  })

  it('locked with a date: shows when it opens and a disabled button', () => {
    renderRow(makeReviewItem({ canSubmit: false, reviewUnlocksAt: '2026-10-05T14:30:00Z' }))

    expect(screen.getByText(/review opens on/i)).toHaveTextContent(/Oct 5, 2026/)
    expect(screen.getByRole('button', { name: 'Write review' })).toBeDisabled()
  })

  it('locked with no derivable date: says it is available after the interview', () => {
    renderRow(makeReviewItem({ canSubmit: false, reviewUnlocksAt: null }))

    expect(screen.getByText('Available after your interview')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Write review' })).toBeDisabled()
  })

  it('unlocked with no review: offers Write review, which opens the form', async () => {
    renderRow(makeReviewItem({ canSubmit: true }))

    const button = screen.getByRole('button', { name: 'Write review' })
    expect(button).toBeEnabled()

    await userEvent.click(button)

    expect(await screen.findByText('Review this company')).toBeInTheDocument()
  })

  it.each(['Pending', 'Published'] as const)('%s: shows the badge, the content, and Edit + Withdraw', (status) => {
    renderRow(makeReviewItem({ canSubmit: false, review: makeReview({ status }), canEdit: true, canWithdraw: true }))

    expect(screen.getByText(status === 'Pending' ? 'Pending review' : 'Published')).toBeInTheDocument()
    expect(screen.getByText('Friendly, well organised process.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Write review' })).not.toBeInTheDocument()
  })

  it('Rejected: shows the moderator reason and explanation, and still allows Edit + Withdraw', () => {
    renderRow(
      makeReviewItem({
        canSubmit: false,
        review: makeReview({
          status: 'Rejected',
          moderationReason: 'PersonalInformation',
          moderationDetails: "Please remove the recruiter's name.",
        }),
        canEdit: true,
        canWithdraw: true,
      })
    )

    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText(/Not approved by a moderator — Personal information/)).toBeInTheDocument()
    expect(screen.getByText("Please remove the recruiter's name.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Withdraw' })).toBeInTheDocument()
  })

  it('Hidden: shows the reason but offers no actions', () => {
    renderRow(
      makeReviewItem({
        canSubmit: false,
        review: makeReview({
          status: 'Hidden',
          moderationReason: 'FalseOrMisleading',
          moderationDetails: 'Could not be verified.',
        }),
        canEdit: false,
        canWithdraw: false,
      })
    )

    expect(screen.getByText('Hidden')).toBeInTheDocument()
    expect(screen.getByText(/Hidden by a moderator — False or misleading/)).toBeInTheDocument()
    expect(screen.getByText('Could not be verified.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('Withdrawn: shows only the badge and a note, with no content or actions', () => {
    renderRow(
      makeReviewItem({ canSubmit: false, review: makeReview({ status: 'Withdrawn' }), canEdit: false, canWithdraw: false })
    )

    expect(screen.getByText('Withdrawn')).toBeInTheDocument()
    expect(screen.getByText(/you withdrew this review/i)).toBeInTheDocument()
    expect(screen.queryByText('Friendly, well organised process.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not show a moderation note for an approved review', () => {
    renderRow(
      makeReviewItem({ canSubmit: false, review: makeReview({ status: 'Published' }), canEdit: true, canWithdraw: true })
    )

    expect(screen.queryByText(/moderator/i)).not.toBeInTheDocument()
  })

  it('opens the withdraw confirmation from the Withdraw button', async () => {
    renderRow(makeReviewItem({ canSubmit: false, review: makeReview(), canEdit: true, canWithdraw: true }))

    await userEvent.click(screen.getByRole('button', { name: 'Withdraw' }))

    expect(await screen.findByText(/this is final/i)).toBeInTheDocument()
  })

  it('opens the edit form pre-filled from the Edit button', async () => {
    renderRow(makeReviewItem({ canSubmit: false, review: makeReview(), canEdit: true, canWithdraw: true }))

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(await screen.findByText('Edit your review')).toBeInTheDocument()
    expect(screen.getByLabelText(/written feedback/i)).toHaveValue('Friendly, well organised process.')
  })

  it('truncates an unbroken-string job title instead of overflowing', () => {
    const longJobTitle = 'a'.repeat(200)
    renderRow(makeReviewItem({ jobTitle: longJobTitle }))

    expect(screen.getByText(longJobTitle)).toHaveClass('truncate')
  })

  it('wraps an unbroken-string moderation detail instead of overflowing', () => {
    const longDetails = 'b'.repeat(200)
    renderRow(
      makeReviewItem({
        canSubmit: false,
        review: makeReview({
          status: 'Rejected',
          moderationReason: 'PersonalInformation',
          moderationDetails: longDetails,
        }),
        canEdit: true,
        canWithdraw: true,
      })
    )

    expect(screen.getByText(longDetails)).toHaveClass('break-words')
  })
})
