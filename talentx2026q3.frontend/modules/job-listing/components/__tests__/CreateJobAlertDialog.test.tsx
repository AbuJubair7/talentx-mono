import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useHeaderSession } from '@/components/common/use-header-session';
import { useCreateJobAlert } from '@/modules/job-alerts';
import type { JobFilterParams } from '@/types/job';
import { CreateJobAlertDialog } from '../CreateJobAlertDialog';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/common/use-header-session', () => ({
  useHeaderSession: jest.fn(),
}));

jest.mock('@/modules/job-alerts', () => ({
  useCreateJobAlert: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedUseHeaderSession = useHeaderSession as jest.Mock;
const mockedUseCreateJobAlert = useCreateJobAlert as jest.Mock;

describe('CreateJobAlertDialog', () => {
  const mockPush = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockOnAlertCreated = jest.fn();
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push: mockPush });
    mockedUseCreateJobAlert.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  describe('Unauthenticated Guest User', () => {
    beforeEach(() => {
      mockedUseHeaderSession.mockReturnValue({
        isAuthenticated: false,
        isTalent: false,
        isEmployer: false,
      });
    });

    it('renders login prompt modal for guest users', () => {
      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText('Sign in to Create Job Alerts')).toBeInTheDocument();
      expect(
        screen.getByText(/Never miss an opportunity. Sign in as a candidate/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In to Continue' })).toBeInTheDocument();
    });

    it('navigates to login page when Sign In is clicked', () => {
      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Sign In to Continue' }));
      expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=/jobs');
    });

    it('calls onOpenChange with false when Cancel is clicked', () => {
      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Employer Account User', () => {
    beforeEach(() => {
      mockedUseHeaderSession.mockReturnValue({
        isAuthenticated: true,
        isTalent: false,
        isEmployer: true,
      });
    });

    it('renders candidate-only explanation dialog for employers', () => {
      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText('Candidate Job Alerts')).toBeInTheDocument();
      expect(
        screen.getByText(/Job alerts are exclusively available for candidate accounts/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to Employer Portal' })).toBeInTheDocument();
    });

    it('redirects to employer portal when button is clicked', () => {
      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Go to Employer Portal' }));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockPush).toHaveBeenCalledWith('/employers/jobs');
    });
  });

  describe('Authenticated Candidate / Talent User', () => {
    beforeEach(() => {
      mockedUseHeaderSession.mockReturnValue({
        isAuthenticated: true,
        isTalent: true,
        isEmployer: false,
      });
    });

    it('renders form and pre-populates fields from active search filters', () => {
      const activeFilters: JobFilterParams = {
        keyword: 'Fullstack Engineer',
        location: 'Berlin',
        employmentType: 'FullTime',
        experienceLevel: 'SeniorLevel',
        workArrangement: 'Hybrid',
      };

      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          filters={activeFilters}
        />
      );

      expect(screen.getByText('Create Job Alert')).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/Alert Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Fullstack Engineer in Berlin Alert');

      const titleInput = screen.getByLabelText(/Role or Keyword/i) as HTMLInputElement;
      expect(titleInput.value).toBe('Fullstack Engineer');

      const locationInput = screen.getByLabelText(/Location/i) as HTMLInputElement;
      expect(locationInput.value).toBe('Berlin');

      const employmentSelect = screen.getByLabelText('Filter by employment type') as HTMLSelectElement;
      expect(employmentSelect.value).toBe('FullTime');

      const experienceSelect = screen.getByLabelText('Filter by experience level') as HTMLSelectElement;
      expect(experienceSelect.value).toBe('SeniorLevel');

      const arrangementSelect = screen.getByLabelText('Filter by work arrangement') as HTMLSelectElement;
      expect(arrangementSelect.value).toBe('Hybrid');
    });

    it('validates required fields and shows error messages when empty', async () => {
      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const nameInput = screen.getByLabelText(/Alert Name/i);
      const titleInput = screen.getByLabelText(/Role or Keyword/i);

      fireEvent.change(nameInput, { target: { value: '   ' } });
      fireEvent.change(titleInput, { target: { value: '' } });

      fireEvent.click(screen.getByRole('button', { name: 'Create Alert' }));

      await waitFor(() => {
        expect(screen.getByText('Alert name is required.')).toBeInTheDocument();
        expect(screen.getByText('Role or title keyword is required.')).toBeInTheDocument();
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('submits form with trimmed values and closes dialog on success', async () => {
      mockMutateAsync.mockResolvedValueOnce('new-alert-123');

      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onAlertCreated={mockOnAlertCreated}
        />
      );

      const nameInput = screen.getByLabelText(/Alert Name/i);
      const titleInput = screen.getByLabelText(/Role or Keyword/i);
      const locationInput = screen.getByLabelText(/Location/i);
      const employmentSelect = screen.getByLabelText('Filter by employment type');

      fireEvent.change(nameInput, { target: { value: '  Frontend React Alert  ' } });
      fireEvent.change(titleInput, { target: { value: '  React Developer  ' } });
      fireEvent.change(locationInput, { target: { value: '  Remote  ' } });
      fireEvent.change(employmentSelect, { target: { value: 'FullTime' } });

      fireEvent.click(screen.getByRole('button', { name: 'Create Alert' }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          name: 'Frontend React Alert',
          title: 'React Developer',
          location: 'Remote',
          employmentType: 'FullTime',
          experienceLevel: null,
          workArrangement: null,
        });
      });

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnAlertCreated).toHaveBeenCalledWith('new-alert-123');
    });

    it('disables submit button and shows spinner while mutation is pending', () => {
      mockedUseCreateJobAlert.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      });

      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Creating Alert…/i });
      expect(submitButton).toBeDisabled();
    });

    it('dismisses dialog when Cancel is clicked', () => {
      render(
        <CreateJobAlertDialog
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
