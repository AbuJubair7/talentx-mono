import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ApplyLoginWarningDialog } from '../ApplyLoginWarningDialog';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;

describe('ApplyLoginWarningDialog', () => {
  const mockPush = jest.fn();
  const mockOnOpenChange = jest.fn();
  const jobId = 'job-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockPush });
  });

  it('renders the warning copy when open', () => {
    render(
      <ApplyLoginWarningDialog open={true} onOpenChange={mockOnOpenChange} jobId={jobId} />
    );

    expect(
      screen.getByText('Already have a TalentX account?')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in first and we'll apply with your saved profile and resume/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in to apply' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue as guest' })).toBeInTheDocument();
  });

  it('navigates to login page when Sign in to apply is clicked', () => {
    render(
      <ApplyLoginWarningDialog open={true} onOpenChange={mockOnOpenChange} jobId={jobId} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign in to apply' }));
    expect(mockPush).toHaveBeenCalledWith('/login?redirect=/jobs/job-123/apply');
  });

  it('dismisses the dialog when Continue as guest is clicked', () => {
    render(
      <ApplyLoginWarningDialog open={true} onOpenChange={mockOnOpenChange} jobId={jobId} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue as guest' }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
