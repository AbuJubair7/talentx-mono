import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SignupPage from '../app/(public)/(auth)/signup/page'
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service'
import { decodeAccessToken, type SessionPayload } from '@/lib/auth/jwt'
import { redirect } from 'next/navigation'
import { UserRole } from '@/types/auth'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}))

jest.mock('@/modules/auth/shared/auth-cookies.service', () => ({
  getAuthCookies: jest.fn(),
}))

jest.mock('@/lib/auth/jwt', () => ({
  decodeAccessToken: jest.fn(),
}))

const mockedGetAuthCookies = getAuthCookies as jest.MockedFunction<typeof getAuthCookies>
const mockedDecodeAccessToken = decodeAccessToken as jest.MockedFunction<typeof decodeAccessToken>
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('Employer Signup Page (TX26-191)', () => {
  beforeEach(() => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: null, refreshToken: null })
    mockedDecodeAccessToken.mockReturnValue(null)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders brand showcase and the streamlined two signup options (Google & Email with attached arrow button)', async () => {
    renderWithProviders(await SignupPage())

    // Check brand showcase panel
    expect(screen.getByText(/Reduce hiring effort/i)).toBeInTheDocument()
    expect(screen.getByText(/Accelerate hiring decisions/i)).toBeInTheDocument()
    expect(screen.getByText(/Automated CV Screening Analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Job Descriptions/i)).toBeInTheDocument()
    expect(screen.getByText(/Candidate Ranking/i)).toBeInTheDocument()
    expect(screen.getByText(/^CV Screening$/i)).toBeInTheDocument()

    // Check 2 options: Google and Work Email with attached arrow submit button
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /^Work Email$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit work email/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting an empty email', async () => {
    renderWithProviders(await SignupPage())

    const submitBtn = screen.getByRole('button', { name: /Submit work email/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Please enter your work email/i)).toBeInTheDocument()
    })
  })

  it('redirects an already logged-in Employer to /dashboard', async () => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: 'valid-token', refreshToken: 'refresh-token' })
    mockedDecodeAccessToken.mockReturnValue({ sub: 'user-1', role: UserRole.Employer } as SessionPayload)

    await SignupPage()

    expect(mockedRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('renders the signup form when only a refresh token exists (no inline refresh)', async () => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: null, refreshToken: 'refresh-token' })
    mockedDecodeAccessToken.mockReturnValue(null)

    renderWithProviders(await SignupPage())

    expect(mockedRedirect).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
  })
})
