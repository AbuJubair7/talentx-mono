import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmployerInterviewListView } from '../components/EmployerInterviewListView'
import { useJobInterviews } from '../hooks/useJobInterviews'
import type {
  EmployerInterviewDto,
  InterviewStatusFilter,
  InterviewTypeFilter,
  PaginatedInterviewList,
} from '../types/interview.types'

jest.mock('../hooks/useJobInterviews')
// The table is covered by its own test; stub it so this test focuses on the container's states.
jest.mock('../components/EmployerInterviewTable', () => ({
  EmployerInterviewTable: ({ interviews }: { interviews: EmployerInterviewDto[] }) => (
    <div data-testid="table">{interviews.length} rows</div>
  ),
}))
// The real Select-based toolbar is covered by its own test; stub it with plain buttons so this
// test can drive filter changes without fighting the real Base UI popover's jsdom lifecycle.
jest.mock('../components/EmployerInterviewSearchToolbar', () => ({
  EmployerInterviewSearchToolbar: ({
    onStatusFilterChange,
    onTypeFilterChange,
  }: {
    onStatusFilterChange: (value: InterviewStatusFilter) => void
    onTypeFilterChange: (value: InterviewTypeFilter) => void
  }) => (
    <div data-testid="toolbar">
      <button type="button" onClick={() => onStatusFilterChange('Accepted')}>
        Set status Accepted
      </button>
      <button type="button" onClick={() => onTypeFilterChange('OnSite')}>
        Set type OnSite
      </button>
    </div>
  ),
}))

const mockedUseJobInterviews = useJobInterviews as jest.MockedFunction<typeof useJobInterviews>

type HookResult = ReturnType<typeof useJobInterviews>

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

function pageData(overrides: Partial<PaginatedInterviewList<EmployerInterviewDto>> = {}) {
  return {
    items: [{ id: 'int-1' } as EmployerInterviewDto],
    page: 1,
    pageSize: 10,
    totalCount: 25,
    totalPages: 3,
    ...overrides,
  }
}

afterEach(() => jest.clearAllMocks())

describe('EmployerInterviewListView', () => {
  it('shows a loading state', () => {
    mockedUseJobInterviews.mockReturnValue(hookState({ isPending: true }))
    render(<EmployerInterviewListView jobId="job-1" />)
    expect(screen.getByText(/loading interview invitations/i)).toBeInTheDocument()
  })

  it('shows an error message with a working retry button', async () => {
    const refetch = jest.fn()
    mockedUseJobInterviews.mockReturnValue(
      hookState({ isError: true, error: new Error('boom'), refetch })
    )
    render(<EmployerInterviewListView jobId="job-1" />)

    expect(screen.getByText('boom')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows the empty state when no invitations have been sent', () => {
    mockedUseJobInterviews.mockReturnValue(hookState({ data: pageData({ items: [], totalCount: 0, totalPages: 1 }) }))
    render(<EmployerInterviewListView jobId="job-1" />)
    expect(screen.getByText(/no interview invitations sent yet/i)).toBeInTheDocument()
  })

  it('renders the table and pagination summary when there is data', () => {
    mockedUseJobInterviews.mockReturnValue(hookState({ data: pageData() }))
    render(<EmployerInterviewListView jobId="job-1" />)

    expect(screen.getByTestId('table')).toHaveTextContent('1 rows')
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
  })

  it('disables Previous on the first page and enables Next', () => {
    mockedUseJobInterviews.mockReturnValue(hookState({ data: pageData() }))
    render(<EmployerInterviewListView jobId="job-1" />)

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()
  })

  it('disables both pager buttons while a background fetch is in flight', () => {
    mockedUseJobInterviews.mockReturnValue(hookState({ data: pageData(), isFetching: true }))
    render(<EmployerInterviewListView jobId="job-1" />)

    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('resets to page 1 and passes the selected status through to useJobInterviews', async () => {
    mockedUseJobInterviews.mockReturnValue(hookState({ data: pageData() }))
    const user = userEvent.setup()
    render(<EmployerInterviewListView jobId="job-1" />)

    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /set status accepted/i }))

    const lastCall = mockedUseJobInterviews.mock.calls.at(-1)
    expect(lastCall).toEqual(['job-1', expect.objectContaining({ status: 'Accepted', type: undefined, page: 1 })])
  })

  it('resets to page 1 and passes the selected type through to useJobInterviews', async () => {
    mockedUseJobInterviews.mockReturnValue(hookState({ data: pageData() }))
    const user = userEvent.setup()
    render(<EmployerInterviewListView jobId="job-1" />)

    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /set type onsite/i }))

    const lastCall = mockedUseJobInterviews.mock.calls.at(-1)
    expect(lastCall).toEqual(['job-1', expect.objectContaining({ status: undefined, type: 'OnSite', page: 1 })])
  })
})
