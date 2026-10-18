import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OnboardingPage from '../app/(public)/(auth)/onboarding/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn((key: string) => (key === 'email' ? 'sarah@acme.ai' : null)),
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

describe('Employer Onboarding Page (TX26-191)', () => {
  it('renders brand showcase and profile input fields', () => {
    renderWithProviders(<OnboardingPage />)

    // Check brand panel is present
    expect(screen.getByText(/Reduce hiring effort/i)).toBeInTheDocument()
    expect(screen.getByText(/Automated CV Screening Analysis/i)).toBeInTheDocument()

    // Check profile fields
    expect(screen.getByText(/Complete your profile/i)).toBeInTheDocument()
    expect(screen.getByText(/sarah@acme.ai/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Company \/ Organization Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Complete Setup & Enter Dashboard/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty profile fields', async () => {
    renderWithProviders(<OnboardingPage />)

    const submitBtn = screen.getByRole('button', { name: /Complete Setup & Enter Dashboard/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Please enter your full name/i)).toBeInTheDocument()
      expect(screen.getByText(/Please enter your company or organization name/i)).toBeInTheDocument()
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument()
    })
  })
})
