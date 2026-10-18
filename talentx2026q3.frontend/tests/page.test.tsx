import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import Home from '@/app/page'
import * as homeService from '@/modules/home/services/home.service'
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service'
import { decodeAccessToken } from '@/lib/auth/jwt'
import { UserRole } from '@/types/auth'
import type { SessionPayload } from '@/lib/auth/jwt'
import type { JobDto } from '@/types/job'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch: () => null, push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/modules/auth/shared/auth-cookies.service', () => ({
  getAuthCookies: jest.fn(),
}))
const mockedGetAuthCookies = getAuthCookies as jest.MockedFunction<typeof getAuthCookies>

jest.mock('@/lib/auth/jwt', () => ({
  decodeAccessToken: jest.fn(),
}))
const mockedDecodeAccessToken = decodeAccessToken as jest.MockedFunction<typeof decodeAccessToken>

jest.mock('@/modules/auth/logout/services/logout.service', () => ({
  logout: jest.fn(),
}))

jest.mock('@/modules/talent-profile/hooks/useTalentProfile', () => ({
  useTalentProfile: jest.fn(() => ({ data: undefined })),
}))

jest.mock('@/modules/notifications/hooks', () => ({
  ...jest.requireActual('@/modules/notifications/hooks'),
  useNotificationsRealtime: jest.fn(),
  useUnreadNotificationCount: jest.fn(() => ({ data: 0 })),
}))

jest.mock('@/modules/home/services/home.service')
const mockedGetRecentJobs = jest.mocked(homeService.getRecentJobs)

function renderWithClient(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const jobs: JobDto[] = [{
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
}]

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders home content and unauthenticated header when no session exists', async () => {
    mockedGetAuthCookies.mockResolvedValueOnce({ accessToken: null, refreshToken: null })
    mockedDecodeAccessToken.mockReturnValue(null)
    mockedGetRecentJobs.mockResolvedValueOnce(jobs)

    const pageElement = await Home()
    renderWithClient(pageElement)

    await waitFor(() =>
      expect(screen.getByText(/Recently Published Roles/i)).toBeInTheDocument(),
    )

    const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
    expect(signInButtons.length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByTestId('user-menu-trigger')).not.toBeInTheDocument()
  })

  it('renders authenticated header with user menu when logged in as Employer', async () => {
    const mockEmployerSession: SessionPayload = {
      sub: 'employer-user-123',
      role: UserRole.Employer,
      email: 'recruiter@acme.com',
      name: 'Acme Corporation',
    }
    mockedGetAuthCookies.mockResolvedValueOnce({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' })
    mockedDecodeAccessToken.mockReturnValueOnce(mockEmployerSession)
    mockedGetRecentJobs.mockResolvedValueOnce(jobs)

    const pageElement = await Home()
    renderWithClient(pageElement)

    await waitFor(() =>
      expect(screen.getByText(/Recently Published Roles/i)).toBeInTheDocument(),
    )

    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.getByTestId('user-menu-trigger')).toBeInTheDocument()
    expect(screen.getByText('AC')).toBeInTheDocument()
  })

  it('renders authenticated header with user menu when logged in as Talent', async () => {
    const mockTalentSession: SessionPayload = {
      sub: 'talent-user-456',
      role: UserRole.Talent,
      email: 'talent@example.com',
      name: 'John Doe',
    }
    mockedGetAuthCookies.mockResolvedValueOnce({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' })
    mockedDecodeAccessToken.mockReturnValueOnce(mockTalentSession)
    mockedGetRecentJobs.mockResolvedValueOnce(jobs)

    const pageElement = await Home()
    renderWithClient(pageElement)

    await waitFor(() =>
      expect(screen.getByText(/Recently Published Roles/i)).toBeInTheDocument(),
    )

    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.getByTestId('user-menu-trigger')).toBeInTheDocument()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })
})