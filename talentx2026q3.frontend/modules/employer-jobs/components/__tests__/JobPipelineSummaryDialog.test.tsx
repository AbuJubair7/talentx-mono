import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { JobPipelineSummaryDialog } from '../JobPipelineSummaryDialog';
import { useJobPipelineSummary } from '../../hooks/useJobPipelineSummary';
import type { EmployerJobListItemDto } from '../../types/employer-job.types';

const DialogContext = React.createContext<{ onOpenChange?: (open: boolean) => void }>({});

jest.mock('@/components/ui/dialog', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactModule = require('react');
  return {
    Dialog: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) =>
      open ? (
        <DialogContext.Provider value={{ onOpenChange }}>
          <div role="dialog">{children}</div>
        </DialogContext.Provider>
      ) : null,
    DialogContent: ({
      children,
      showCloseButton = true,
      className,
    }: {
      children: React.ReactNode;
      showCloseButton?: boolean;
      className?: string;
    }) => {
      const { onOpenChange } = ReactModule.useContext(DialogContext);
      return (
        <div className={className}>
          {children}
          {showCloseButton && (
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange?.(false)}
            >
              Close
            </button>
          )}
        </div>
      );
    },
    DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <h2 className={className}>{children}</h2>
    ),
    DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <p className={className}>{children}</p>
    ),
  };
});

jest.mock('../../hooks/useJobPipelineSummary', () => ({
  useJobPipelineSummary: jest.fn(),
}));

const mockUseJobPipelineSummary = useJobPipelineSummary as jest.Mock;

describe('JobPipelineSummaryDialog', () => {
  const mockJob: EmployerJobListItemDto = {
    id: 'job-123',
    title: 'Senior AI Engineer',
    companyName: 'Acme AI Corp',
    status: 'Published',
    employmentType: 'FullTime',
    workArrangement: 'FullRemote',
    experienceLevel: 'Senior',
    location: 'San Francisco, CA',
    vacancies: 3,
    expireAt: '2026-12-31T23:59:59Z',
    createdAt: '2026-01-15T10:00:00Z',
    applicantCount: 22,
  };

  const defaultProps = {
    job: mockJob,
    isOpen: true,
    onClose: jest.fn(),
  };

  const mockPipelineData = {
    jobId: 'job-123',
    jobTitle: 'Senior AI Engineer',
    companyName: 'Acme AI Corp',
    jobStatus: 'Published',
    vacancies: 3,
    postedDate: '2026-01-15T10:00:00Z',
    totalApplicants: 22,
    pipelineStats: {
      appliedCount: 10,
      shortlistedCount: 4,
      invitedCount: 3,
      interviewCount: 2,
      rejectedCount: 2,
      hiredCount: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseJobPipelineSummary.mockReturnValue({
      data: mockPipelineData,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders job header details including title, company, status, vacancies, and posted date', () => {
    render(<JobPipelineSummaryDialog {...defaultProps} />);

    expect(screen.getByText('Acme AI Corp')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Senior AI Engineer' })).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('3 Vacancies')).toBeInTheDocument();
    expect(screen.getByText(/Posted/i)).toBeInTheDocument();
  });

  it('renders singular vacancy text when job vacancies count is 1', () => {
    const singleVacancyJob: EmployerJobListItemDto = {
      ...mockJob,
      vacancies: 1,
    };

    render(<JobPipelineSummaryDialog {...defaultProps} job={singleVacancyJob} />);

    expect(screen.getByText('1 Vacancy')).toBeInTheDocument();
  });

  it('renders pipeline stage breakdown with correct counts and percentages', () => {
    render(<JobPipelineSummaryDialog {...defaultProps} />);

    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('Candidates')).toBeInTheDocument();

    expect(screen.queryByText('Applied')).toBeNull();

    expect(screen.getByText('Shortlisted')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('(18%)')).toBeInTheDocument();

    expect(screen.getByText('Invited')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('(14%)')).toBeInTheDocument();

    expect(screen.getByText('Interview')).toBeInTheDocument();
    const interviewItem = screen.getByText('Interview').closest('li')!;
    expect(within(interviewItem).getByText('2')).toBeInTheDocument();
    expect(within(interviewItem).getByText('(9%)')).toBeInTheDocument();

    expect(screen.getByText('Hired')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('(5%)')).toBeInTheDocument();

    expect(screen.getByText('Rejected')).toBeInTheDocument();
    const rejectedItem = screen.getByText('Rejected').closest('li')!;
    expect(within(rejectedItem).getByText('2')).toBeInTheDocument();
    expect(within(rejectedItem).getByText('(9%)')).toBeInTheDocument();
  });

  it('renders empty state message and 0 candidates when total applicants is 0', () => {
    mockUseJobPipelineSummary.mockReturnValue({
      data: {
        ...mockPipelineData,
        totalApplicants: 0,
        pipelineStats: {
          appliedCount: 0,
          shortlistedCount: 0,
          invitedCount: 0,
          interviewCount: 0,
          rejectedCount: 0,
          hiredCount: 0,
        },
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<JobPipelineSummaryDialog {...defaultProps} />);

    expect(screen.getAllByText('0')).toHaveLength(6);
    expect(screen.getByText('Candidates')).toBeInTheDocument();

    const emptyBanner = screen.getByRole('status');
    expect(emptyBanner).toBeInTheDocument();
    expect(emptyBanner).toHaveTextContent(
      'No applicants yet. As candidates apply or receive invitations, their progress across stages will appear here.'
    );
  });

  it('renders accessible loading skeleton when isLoading is true', () => {
    mockUseJobPipelineSummary.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });

    render(<JobPipelineSummaryDialog {...defaultProps} />);

    const loadingStatus = screen.getByRole('status', {
      name: 'Loading candidate pipeline summary',
    });
    expect(loadingStatus).toBeInTheDocument();
    expect(screen.queryByText('Candidates')).not.toBeInTheDocument();
  });

  it('renders friendly error message and calls refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockRefetch = jest.fn();

    mockUseJobPipelineSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<JobPipelineSummaryDialog {...defaultProps} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to load pipeline summary')).toBeInTheDocument();
    expect(
      screen.getByText(
        'There was an issue fetching the candidate pipeline data for this job. Please try again.'
      )
    ).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('closes dialog and calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onCloseMock = jest.fn();

    render(<JobPipelineSummaryDialog {...defaultProps} onClose={onCloseMock} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('does not render dialog content when isOpen is false', () => {
    render(<JobPipelineSummaryDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('returns null and does not render when job is null', () => {
    render(<JobPipelineSummaryDialog {...defaultProps} job={null} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports interactive legend mouse enter and leave events', () => {
    render(<JobPipelineSummaryDialog {...defaultProps} />);

    const shortlistedItem = screen.getByText('Shortlisted').closest('li');
    expect(shortlistedItem).toBeInTheDocument();

    if (shortlistedItem) {
      fireEvent.mouseEnter(shortlistedItem);
      fireEvent.mouseLeave(shortlistedItem);
    }
  });
});
