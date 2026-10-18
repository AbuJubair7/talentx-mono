import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerifyEmailPage from '../app/(public)/(auth)/verify-email/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key: string) => (key === 'email' ? 'test@example.com' : null)),
  }),
}))

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

describe('Employer Verify Email Page (TX26-191)', () => {
  it('renders OTP input fields and verification controls', () => {
    renderWithProviders(<VerifyEmailPage />)

    expect(screen.getByText(/Check your email/i)).toBeInTheDocument()
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Verify & Continue/i })).toBeInTheDocument()
    expect(screen.getByText(/Resend Code/i)).toBeInTheDocument()
    expect(screen.getByText(/Change email/i)).toBeInTheDocument()
  })
})
