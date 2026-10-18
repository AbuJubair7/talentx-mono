import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makePublicReview, makeSummary } from '@/tests/test-utils/company-review-fixtures'
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { CompanyReviewsSection } from '../components/CompanyReviewsSection'
import { usePublicCompanyReviews } from '../hooks/usePublicCompanyReviews'

jest.mock('../hooks/usePublicCompanyReviews')

const mockedUsePublicCompanyReviews = usePublicCompanyReviews as jest.MockedFunction<typeof usePublicCompanyReviews>
const refetch = jest.fn()
const fetchNextPage = jest.fn()

function mockResult(overrides: Record<string, unknown>) {
  mockedUsePublicCompanyReviews.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    hasNextPage: false,
    fetchNextPage,
    refetch,
    ...overrides,
  } as unknown as ReturnType<typeof usePublicCompanyReviews>)
}

const pages = (items: ReturnType<typeof makePublicReview>[], extra: Record<string, unknown> = {}) => ({
  pages: [{ items, page: 1, pageSize: 10, totalCount: items.length, totalPages: 1, ...extra }],
})

function renderSection(summary = makeSummary()) {
  return render(<CompanyReviewsSection companyId="company-1" summary={summary} />, {
    wrapper: createQueryWrapper(),
  })
}

beforeEach(() => jest.clearAllMocks())

describe('CompanyReviewsSection', () => {
  it('renders the summary card alongside the review list', () => {
    mockResult({ data: pages([makePublicReview()]) })
    renderSection(makeSummary({ totalCount: 1 }))

    expect(screen.getByText('Reflects published reviews only.')).toBeInTheDocument()
    expect(screen.getByText('Based on 1 review')).toBeInTheDocument()
  })

  it('shows an empty state with 0 reviews and aligns with my-0', () => {
    mockResult({ data: pages([]) })
    renderSection()

    const emptyTitle = screen.getByText('No reviews yet')
    expect(emptyTitle).toBeInTheDocument()
    const emptyContainer = emptyTitle.closest('div')
    expect(emptyContainer).toHaveClass('my-0')
    expect(emptyContainer).not.toHaveClass('my-6')
  })

  it('renders 1 review with its comment', () => {
    mockResult({ data: pages([makePublicReview({ comment: 'Great onboarding experience.' })]) })
    renderSection()

    expect(screen.getByText('Great onboarding experience.')).toBeInTheDocument()
  })

  it('renders an all-negative review', () => {
    mockResult({
      data: pages([makePublicReview({ sentiment: 'Negative', comment: 'Slow process.' })]),
    })
    renderSection()

    expect(screen.getByText('Negative')).toBeInTheDocument();
  })

  it('shows "Not rated yet" for areas with no ratings in the summary', () => {
    mockResult({ data: pages([makePublicReview()]) })
    renderSection(makeSummary({ interviewExperience: { average: null, ratingCount: 0 } }))

    expect(screen.getByText('Not rated yet')).toBeInTheDocument()
  })

  it('never shows a job title or status badge (public mode)', () => {
    mockResult({ data: pages([makePublicReview()]) })
    renderSection()

    expect(screen.queryByText('Backend Engineer')).not.toBeInTheDocument()
    expect(screen.queryByText('Published')).not.toBeInTheDocument()
  })

  it('shows a Show more button when there is a next page, and loads it', async () => {
    mockResult({ data: pages([makePublicReview()], { totalPages: 2, totalCount: 2 }), hasNextPage: true })
    renderSection()

    const showMoreButton = screen.getByRole('button', { name: 'Show more' })
    await userEvent.click(showMoreButton)

    expect(fetchNextPage).toHaveBeenCalled()
  })

  it('hides the Show more button when there is no next page', () => {
    mockResult({ data: pages([makePublicReview()]) })
    renderSection()

    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument()
  })

  it('shows an error state with a working retry when initial load fails', async () => {
    mockResult({ isError: true, error: { status: 500, message: 'boom' } })
    renderSection()

    await userEvent.click(screen.getByRole('button', { name: /try again|retry/i }))

    expect(refetch).toHaveBeenCalled()
  })

  it('keeps existing reviews visible and shows inline error with retry when fetching next page fails', async () => {
    mockResult({
      data: pages([makePublicReview({ comment: 'First page review comment' })]),
      hasNextPage: true,
      isError: true,
      isFetchNextPageError: true,
    })
    renderSection()

    expect(screen.getByText('First page review comment')).toBeInTheDocument()
    expect(screen.getByText('Failed to load more reviews.')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: 'Retry' })
    await userEvent.click(retryButton)

    expect(fetchNextPage).toHaveBeenCalled()
    expect(refetch).not.toHaveBeenCalled()
  })
})
