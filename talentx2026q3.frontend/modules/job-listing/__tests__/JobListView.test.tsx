import { render, screen, fireEvent } from '@testing-library/react'
import { JobListView } from '../components/JobListView'
import type { JobListItem, PagedResult } from '../types/job.types'

const mockJob: JobListItem = {
  id: 'job-1',
  title: 'Senior React Developer',
  companyName: 'Acme Corp',
  location: 'Dhaka',
  city: 'Dhaka',
  country: 'Bangladesh',
  employmentType: 'FullTime',
  experienceLevel: 'SeniorLevel',
  workArrangement: 'Hybrid',
  requiredSkills: ['React', 'TypeScript', 'Next.js'],
  createdAt: new Date().toISOString(),
  expireAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
}

const onePageResult: PagedResult<JobListItem> = {
  items: [mockJob],
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
}

const emptyResult: PagedResult<JobListItem> = {
  items: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
}

describe('JobListView', () => {
  it('renders job title and company name', () => {
    render(
      <JobListView
        result={onePageResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    )
    expect(screen.getByText('Senior React Developer')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders formatted employment type badge', () => {
    render(
      <JobListView
        result={onePageResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    )
    expect(screen.getByText('Full Time')).toBeInTheDocument()
  })

  it('renders formatted experience level badge', () => {
    render(
      <JobListView
        result={onePageResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    )
    expect(screen.getByText('Senior Level')).toBeInTheDocument()
  })

  it('renders required skills chips', () => {
    render(
      <JobListView
        result={onePageResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    )
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })

  it('shows empty state with no filters message when no jobs and no active filters', () => {
    render(
      <JobListView
        result={emptyResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    )
    expect(screen.getByText('No open positions')).toBeInTheDocument()
    expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument()
  })

  it('shows empty state with filter-specific message and clear button when filters are active', () => {
    const onClearAll = jest.fn()
    render(
      <JobListView
        result={emptyResult}
        hasFilters={true}
        onPageChange={jest.fn()}
        onClearAll={onClearAll}
      />
    )
    expect(screen.getByText('No jobs match your filters')).toBeInTheDocument()
    const clearBtn = screen.getByText('Clear all filters')
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })

  it('does not show pagination when there is only one page', () => {
    render(
      <JobListView
        result={onePageResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    )
    expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument()
  })

  it('calls onPageChange with correct page when clicking Next', () => {
    const onPageChange = jest.fn()
    const multiPageResult: PagedResult<JobListItem> = {
      items: [mockJob],
      page: 1,
      pageSize: 10,
      totalCount: 25,
      totalPages: 3,
    }
    render(
      <JobListView
        result={multiPageResult}
        hasFilters={false}
        onPageChange={onPageChange}
        onClearAll={jest.fn()}
      />
    )
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('links Apply Now to guest apply route when user is not logged in', () => {
    render(
      <JobListView
        result={onePageResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
        showApplyButton={true}
        isAuthenticatedTalent={false}
      />
    )
    const applyLink = screen.getByRole('link', { name: /apply now/i })
    expect(applyLink).toBeInTheDocument()
    expect(applyLink).toHaveAttribute('href', `/jobs/${mockJob.id}/apply`)
  })

  it('links Apply Now to talent apply route when user is authenticated talent', () => {
    render(
      <JobListView
        result={onePageResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
        showApplyButton={true}
        isAuthenticatedTalent={true}
      />
    )
    const applyLink = screen.getByRole('link', { name: /apply now/i })
    expect(applyLink).toBeInTheDocument()
    expect(applyLink).toHaveAttribute('href', `/apply/${mockJob.id}`)
  })
})

