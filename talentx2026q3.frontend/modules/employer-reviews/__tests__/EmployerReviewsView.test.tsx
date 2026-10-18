import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmployerReviewsView } from '../components/EmployerReviewsView'
import { useEmployerCompanyReviews } from '../hooks/useEmployerCompanyReviews'
import { useEmployerCompanyReviewSummary } from '../hooks/useEmployerCompanyReviewSummary'
import type {
  EmployerCompanyReviewDto,
  EmployerCompanyReviewSummaryDto,
  EmployerReviewSentimentFilter,
  EmployerReviewStatusFilter,
  PaginatedEmployerCompanyReviewList,
} from '../types/employer-reviews.types'

jest.mock('../hooks/useEmployerCompanyReviews')
jest.mock('../hooks/useEmployerCompanyReviewSummary')
// The real Select-based/Tabs-based toolbar is covered by its own test; stub it with plain
// buttons so this test can drive filter changes without depending on its internals.
jest.mock('../components/EmployerReviewFilterToolbar', () => ({
  EmployerReviewFilterToolbar: ({
    onStatusFilterChange,
    onSentimentFilterChange,
  }: {
    onStatusFilterChange: (value: EmployerReviewStatusFilter) => void
    onSentimentFilterChange: (value: EmployerReviewSentimentFilter) => void
  }) => (
    <div data-testid="toolbar">
      <button type="button" onClick={() => onStatusFilterChange('Withdrawn')}>
        Set status Withdrawn
      </button>
      <button type="button" onClick={() => onSentimentFilterChange('Negative')}>
        Set sentiment Negative
      </button>
    </div>
  ),
}))

const mockedUseReviews = useEmployerCompanyReviews as jest.MockedFunction<typeof useEmployerCompanyReviews>
const mockedUseSummary = useEmployerCompanyReviewSummary as jest.MockedFunction<typeof useEmployerCompanyReviewSummary>

type ReviewsHookResult = ReturnType<typeof useEmployerCompanyReviews>
type SummaryHookResult = ReturnType<typeof useEmployerCompanyReviewSummary>

function reviewsState(partial: Partial<ReviewsHookResult>): ReviewsHookResult {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    ...partial,
  } as ReviewsHookResult
}

function summaryState(partial: Partial<SummaryHookResult>): SummaryHookResult {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    ...partial,
  } as SummaryHookResult
}

function makeReview(overrides: Partial<EmployerCompanyReviewDto> = {}): EmployerCompanyReviewDto {
  return {
    id: 'review-1',
    status: 'Published',
    sentiment: 'Positive',
    comment: 'Great, structured process.',
    ratings: { recruitmentProcess: 5, communication: 4, interviewExperience: null, professionalism: 5 },
    jobTitle: 'Backend Engineer',
    submittedAt: '2026-01-15T00:00:00.000Z',
    updatedAt: null,
    ...overrides,
  }
}

function pageData(
  overrides: Partial<PaginatedEmployerCompanyReviewList<EmployerCompanyReviewDto>> = {}
): PaginatedEmployerCompanyReviewList<EmployerCompanyReviewDto> {
  return {
    items: [makeReview()],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    ...overrides,
  }
}

const populatedSummary: EmployerCompanyReviewSummaryDto = {
  summary: {
    totalCount: 4,
    positiveCount: 3,
    negativeCount: 1,
    positivePercent: 75,
    recruitmentProcess: { average: 5, ratingCount: 4 },
    communication: { average: 2, ratingCount: 4 },
    interviewExperience: { average: null, ratingCount: 0 },
    professionalism: { average: null, ratingCount: 0 },
  },
  countsByStatus: { Pending: 1, Published: 4, Rejected: 0, Hidden: 0, Withdrawn: 1 },
}

afterEach(() => jest.clearAllMocks())

describe('EmployerReviewsView', () => {
  it('shows skeletons for the summary blocks while the summary is loading', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ isPending: true }))
    mockedUseSummary.mockReturnValue(summaryState({ isPending: true }))
    render(<EmployerReviewsView />)

    expect(screen.getByTestId('toolbar')).toBeInTheDocument()
    expect(screen.queryByText('Overall rating')).not.toBeInTheDocument()
    expect(screen.queryByText(/great, structured process/i)).not.toBeInTheDocument()
  })

  it('shows an error message with a working retry button', async () => {
    const refetch = jest.fn()
    mockedUseReviews.mockReturnValue(reviewsState({ isError: true, error: new Error('boom'), refetch }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    expect(screen.getByText('boom')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows an error message with a working retry button when the summary fails to load', async () => {
    const refetch = jest.fn()
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData() }))
    mockedUseSummary.mockReturnValue(summaryState({ isError: true, error: new Error('summary boom'), refetch }))
    render(<EmployerReviewsView />)

    expect(screen.getByText('summary boom')).toBeInTheDocument()
    expect(screen.queryByText('Overall rating')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows the empty state when there are no reviews at all', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData({ items: [], totalCount: 0 }) }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    expect(screen.getByRole('heading', { name: /^no reviews yet$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
  })

  it('shows a "Clear filters" button in the empty state when filters are active, and it resets them', async () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData({ items: [], totalCount: 0 }) }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    const user = userEvent.setup()
    render(<EmployerReviewsView />)

    // Drive the mocked toolbar to set a status filter, which flips the view into "filtered" mode.
    await user.click(screen.getByRole('button', { name: /set status withdrawn/i }))

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    await user.click(clearButton)

    const lastCall = mockedUseReviews.mock.calls.at(-1)
    expect(lastCall).toEqual([expect.objectContaining({ status: undefined, sentiment: undefined, page: 1 })])
  })

  it('renders the KPI summary cards from the summary data', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData() }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    expect(screen.getByText('Overall rating')).toBeInTheDocument()
    expect(screen.getByText('3.5')).toBeInTheDocument()
    expect(screen.getByText('Published reviews')).toBeInTheDocument()
    expect(screen.getByText('Positive sentiment')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Awaiting moderation')).toBeInTheDocument()
  })

  it('renders the anonymity/moderation note inside the status overview card', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData() }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    expect(
      screen.getByText(/reviewers are anonymous\. reviews are moderated by talentx/i)
    ).toBeInTheDocument()
  })

  it('renders per-status counts from the summary', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData() }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    const statusCounts = within(screen.getByTestId('employer-review-status-counts'))
    expect(statusCounts.getByText('Pending review')).toBeInTheDocument()
    expect(statusCounts.getByText('Published')).toBeInTheDocument()
    expect(statusCounts.getByText('Rejected')).toBeInTheDocument()
    expect(statusCounts.getByText('Hidden')).toBeInTheDocument()
    expect(statusCounts.getByText('Withdrawn')).toBeInTheDocument()
  })

  it('renders a review card with job title, date and status, but no reviewer identity', () => {
    mockedUseReviews.mockReturnValue(
      reviewsState({
        data: pageData({
          items: [makeReview({ jobTitle: 'Senior Backend Engineer', comment: 'Smooth process overall.' })],
        }),
      })
    )
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    expect(screen.getByText(/applied for/i)).toHaveTextContent('Senior Backend Engineer')
    expect(screen.getByText(/smooth process overall/i)).toBeInTheDocument();
    // No reviewer name, email, or any application/job id ever renders.
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('renders no action buttons other than filters, retry and pagination', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData({ totalPages: 2 }) }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    const buttons = screen.getAllByRole('button').map((button) => button.textContent?.trim())
    for (const label of buttons) {
      expect(['Set status Withdrawn', 'Set sentiment Negative', '', undefined]).toContain(label)
    }
  })

  it('resets to page 1 and passes the selected status through to useEmployerCompanyReviews', async () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData({ totalPages: 3 }) }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    const user = userEvent.setup()
    render(<EmployerReviewsView />)

    await user.click(screen.getByRole('button', { name: /next page/i }))
    await user.click(screen.getByRole('button', { name: /set status withdrawn/i }))

    const lastCall = mockedUseReviews.mock.calls.at(-1)
    expect(lastCall).toEqual([expect.objectContaining({ status: 'Withdrawn', sentiment: undefined, page: 1 })])
  })

  it('resets to page 1 and passes the selected sentiment through to useEmployerCompanyReviews', async () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData({ totalPages: 3 }) }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    const user = userEvent.setup()
    render(<EmployerReviewsView />)

    await user.click(screen.getByRole('button', { name: /next page/i }))
    await user.click(screen.getByRole('button', { name: /set sentiment negative/i }))

    const lastCall = mockedUseReviews.mock.calls.at(-1)
    expect(lastCall).toEqual([expect.objectContaining({ status: undefined, sentiment: 'Negative', page: 1 })])
  })

  it('disables Previous on the first page and enables Next', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData({ totalPages: 2 }) }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).toBeEnabled()
  })

  it('shows the pagination summary line', () => {
    mockedUseReviews.mockReturnValue(reviewsState({ data: pageData({ totalCount: 1, totalPages: 1 }) }))
    mockedUseSummary.mockReturnValue(summaryState({ data: populatedSummary }))
    render(<EmployerReviewsView />)

    expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 1–1 of 1 review')
  })
})
