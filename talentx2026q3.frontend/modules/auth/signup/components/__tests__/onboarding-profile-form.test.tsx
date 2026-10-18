import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnboardingProfileForm } from '../onboarding-profile-form'
import { useSignupEmployer } from '../../hooks/use-signup'

const mockPush = jest.fn()
let mockSearchParams = new URLSearchParams('email=employer@example.com')

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

jest.mock('../../hooks/use-signup', () => ({
  useSignupEmployer: jest.fn(),
}))

const mockedUseSignupEmployer = useSignupEmployer as jest.MockedFunction<typeof useSignupEmployer>

function renderWithProviders(uiElement: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>{uiElement}</QueryClientProvider>
  )
}

describe('OnboardingProfileForm', () => {
  let mockMutate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams = new URLSearchParams('email=employer@example.com')
    mockMutate = jest.fn()
    mockedUseSignupEmployer.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof useSignupEmployer>)
  })

  it('renders specific company duplicate error without showing existing account login prompt', async () => {
    renderWithProviders(<OnboardingProfileForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.change(screen.getByLabelText(/company \/ organization name/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'StrongP@ss123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongP@ss123!' },
    })

    fireEvent.click(screen.getByRole('button', { name: /complete setup/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    const [, callbacks] = mockMutate.mock.calls[0]
    await act(async () => {
      callbacks.onError(new Error("A company with the name 'Acme Corp' is already registered. Please use a different company name."))
    })

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent("A company with the name 'Acme Corp' is already registered. Please use a different company name.")
      expect(screen.queryByText(/log in to your account/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/this account is already registered and verified/i)).not.toBeInTheDocument()
    })
  })

  it('renders existing account alert and login link when employer account is duplicate', async () => {
    renderWithProviders(<OnboardingProfileForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Jane Doe' },
    })
    fireEvent.change(screen.getByLabelText(/company \/ organization name/i), {
      target: { value: 'Unique Company' },
    })
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'StrongP@ss123!' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'StrongP@ss123!' },
    })

    fireEvent.click(screen.getByRole('button', { name: /complete setup/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
    })

    const [, callbacks] = mockMutate.mock.calls[0]
    await act(async () => {
      callbacks.onError(new Error("An employer with email 'employer@example.com' is already registered and verified. Please sign in."))
    })

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toHaveTextContent(/this account is already registered and verified/i)
      expect(screen.getByText(/log in to your account/i)).toBeInTheDocument()
    })
  })
})
