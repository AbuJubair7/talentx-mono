import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import HomeModule from '../components/homeModule'
import type { JobDto } from '@/types/job'
import * as homeService from '../services/home.service'

// Mock the service so the test drives each state deterministically, no real I/O.
jest.mock('../services/home.service')
const mockedGetRecentJobs = jest.mocked(homeService.getRecentJobs)

function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 3600_000).toISOString()

const sampleJobs: JobDto[] = [
  {
    id: 'job-1',
    companyName: 'Northwind Labs',
    title: 'Backend Engineer (.NET)',
    employmentType: 'FullTime',
    location: 'Remote',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'FullRemote',
    requiredSkills: ['C#', '.NET'],
    createdAt: '2026-08-01T00:00:00Z',
    expireAt: '2026-12-31T00:00:00Z',
  },
]

afterEach(() => {
  jest.clearAllMocks()
})

describe('HomeModule', () => {
  it('shows the loading state first, then the jobs', async () => {
    mockedGetRecentJobs.mockResolvedValueOnce(sampleJobs)
    renderWithClient(<HomeModule />)
    await waitFor(() =>
      expect(screen.getByText('Backend Engineer (.NET)')).toBeInTheDocument(),
    )
  })

  it('renders the section header once data has loaded', async () => {
    mockedGetRecentJobs.mockResolvedValueOnce(sampleJobs)
    renderWithClient(<HomeModule />)
    await waitFor(() =>
      expect(screen.getByText(/Recently Published Roles/i)).toBeInTheDocument(),
    )
  })

  it('shows the empty state when no jobs are returned', async () => {
    mockedGetRecentJobs.mockResolvedValueOnce([])
    renderWithClient(<HomeModule />)
    await waitFor(() =>
      expect(screen.getByText(/No recent roles available/i)).toBeInTheDocument(),
    )
  })

  it('shows the error state when the service rejects', async () => {
    mockedGetRecentJobs.mockRejectedValueOnce(new Error('network down'))
    renderWithClient(<HomeModule />)
    await waitFor(() =>
      expect(screen.getByText(/Couldn't load recent jobs/i)).toBeInTheDocument(),
    )
  })

  it('calls the service exactly once', async () => {
    mockedGetRecentJobs.mockResolvedValueOnce(sampleJobs)
    renderWithClient(<HomeModule />)
    await waitFor(() => expect(mockedGetRecentJobs).toHaveBeenCalledTimes(1))
  })
})
