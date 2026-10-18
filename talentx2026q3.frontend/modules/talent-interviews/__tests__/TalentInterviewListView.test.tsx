import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TalentInterviewListView } from '../components/TalentInterviewListView'
import { useMyInterviews } from '../hooks/useMyInterviews'
import type { PaginatedInterviewList, TalentInterviewDto } from '../types/interview.types'

jest.mock('../hooks/useMyInterviews')
jest.mock('../components/TalentInterviewCard', () => ({
  TalentInterviewCard: ({ interview }: { interview: TalentInterviewDto }) => (
    <div data-testid="card">{interview.jobTitle}</div>
  ),
}))

const mockedUseMyInterviews = useMyInterviews as jest.MockedFunction<typeof useMyInterviews>

type HookResult = ReturnType<typeof useMyInterviews>

function hookState(partial: Partial<HookResult>): HookResult {
  return {
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    ...partial,
  } as HookResult
}

function pageData(overrides: Partial<PaginatedInterviewList<TalentInterviewDto>> = {}) {
  return {
    items: [{ id: 'inv-1', jobTitle: 'Backend Engineer' } as TalentInterviewDto],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    ...overrides,
  }
}

afterEach(() => jest.clearAllMocks())

describe('TalentInterviewListView', () => {
  it('renders a loading state', () => {
    mockedUseMyInterviews.mockReturnValue(hookState({ isPending: true }))
    render(<TalentInterviewListView />)
    expect(screen.getByText(/loading your interview invitations/i)).toBeInTheDocument()
  })

  it('renders an error state with a retry button', async () => {
    const refetch = jest.fn()
    mockedUseMyInterviews.mockReturnValue(hookState({ isError: true, error: new Error('down'), refetch }))
    render(<TalentInterviewListView />)

    expect(screen.getByText('down')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders the empty state', () => {
    mockedUseMyInterviews.mockReturnValue(hookState({ data: pageData({ items: [], totalCount: 0 }) }))
    render(<TalentInterviewListView />)
    expect(screen.getByText(/haven't received any interview invitations/i)).toBeInTheDocument()
  })

  it('renders one card per interview and no pager for a single page', () => {
    mockedUseMyInterviews.mockReturnValue(hookState({ data: pageData() }))
    render(<TalentInterviewListView />)

    expect(screen.getByTestId('card')).toHaveTextContent('Backend Engineer')
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('shows the pager when there is more than one page', () => {
    mockedUseMyInterviews.mockReturnValue(hookState({ data: pageData({ totalCount: 25, totalPages: 3 }) }))
    render(<TalentInterviewListView />)

    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
  })
})
