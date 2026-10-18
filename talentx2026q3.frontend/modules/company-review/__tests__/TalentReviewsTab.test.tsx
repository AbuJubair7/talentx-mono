import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { makeReview, makeReviewItem } from '@/tests/test-utils/company-review-fixtures'
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper'

import { TalentReviewsTab } from '../components/TalentReviewsTab'
import { useMyCompanyReviews } from '../hooks/useMyCompanyReviews'

jest.mock('../hooks/useMyCompanyReviews')

const mockedUseMyCompanyReviews = useMyCompanyReviews as jest.MockedFunction<typeof useMyCompanyReviews>
const refetch = jest.fn()

function mockResult(overrides: Record<string, unknown>) {
  mockedUseMyCompanyReviews.mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch,
    ...overrides,
  } as unknown as ReturnType<typeof useMyCompanyReviews>)
}

const page = (items: ReturnType<typeof makeReviewItem>[], extra: Record<string, unknown> = {}) => ({
  items,
  page: 1,
  pageSize: 10,
  totalCount: items.length,
  totalPages: 1,
  ...extra,
})

function renderTab() {
  return render(<TalentReviewsTab />, { wrapper: createQueryWrapper() })
}

beforeEach(() => jest.clearAllMocks())

describe('TalentReviewsTab', () => {
  it('asks for the first page of ten', () => {
    mockResult({ data: page([makeReviewItem()]) })
    renderTab()

    expect(mockedUseMyCompanyReviews).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
  })

  it('shows a loading state', () => {
    mockResult({ isPending: true })
    renderTab()

    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument()
    expect(screen.queryByText('No reviews yet')).not.toBeInTheDocument()
  })

  it('shows an error state with a working retry', async () => {
    mockResult({ isError: true, error: { status: 500, message: 'boom' } })
    renderTab()

    await userEvent.click(screen.getByRole('button', { name: /try again|retry/i }))

    expect(refetch).toHaveBeenCalled()
  })

  it('shows an empty state when there are no accepted interviews', () => {
    mockResult({ data: page([]) })
    renderTab()

    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
    expect(screen.getByText(/after you accept an interview/i)).toBeInTheDocument()
  })

  it('renders one row per application', () => {
    mockResult({
      data: page([
        makeReviewItem({ jobApplicationId: 'a1', companyName: 'Acme Corp' }),
        makeReviewItem({ jobApplicationId: 'a2', companyName: 'Globex', canSubmit: false, review: makeReview(), canEdit: true, canWithdraw: true }),
      ]),
    })
    renderTab()

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Globex')).toBeInTheDocument()
    expect(screen.getByText('2 interviews you can review')).toBeInTheDocument()
  })

  it('has no pagination for a single page', () => {
    mockResult({ data: page([makeReviewItem()]) })
    renderTab()

    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument()
  })

  it('pages forward and back', async () => {
    mockResult({ data: page([makeReviewItem()], { totalPages: 3, totalCount: 25 }) })
    renderTab()

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(mockedUseMyCompanyReviews).toHaveBeenLastCalledWith({ page: 2, pageSize: 10 })

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))

    expect(mockedUseMyCompanyReviews).toHaveBeenLastCalledWith({ page: 1, pageSize: 10 })
  })
})
