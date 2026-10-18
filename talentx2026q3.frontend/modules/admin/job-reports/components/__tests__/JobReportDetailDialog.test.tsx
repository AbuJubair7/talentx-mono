import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobReportDetailDialog } from '../JobReportDetailDialog';
import { useJobReportDetails } from '../../hooks/useJobReportDetails';
import type { JobReportDetails } from '../../types/job-reports.types';

jest.mock('../../hooks/useJobReportDetails', () => ({
  useJobReportDetails: jest.fn(),
}));

jest.mock('../ResolveReportDialog', () => ({
  ResolveReportDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="resolve-dialog" /> : null,
}));

jest.mock('../DismissReportDialog', () => ({
  DismissReportDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="dismiss-dialog" /> : null,
}));

describe('JobReportDetailDialog', () => {
  const mockOnOpenChange = jest.fn();

  const createMockJobReportDetails = (
    overrides?: Partial<JobReportDetails>
  ): JobReportDetails => ({
    id: 'report-123',
    jobId: 'job-456',
    jobTitle: 'Senior Machine Learning Engineer',
    companyName: 'Tech Innovations Corp',
    reason: 'SuspectedScam',
    reasonLabel: 'Suspected Scam',
    status: 'Pending',
    additionalDetails: 'Job asks for fee during application.',
    adminNotes: 'Under review by security team.',
    reporterUserId: 'user-789',
    reporterEmail: 'reporter@example.com',
    createdAt: '2026-09-20T10:00:00Z',
    jobStatus: 'Published',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when isLoading is true', () => {
    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Job Title')).not.toBeInTheDocument();
  });

  it('renders failure message when report is null and isLoading is false', () => {
    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(
      screen.getByText('Failed to load report details.')
    ).toBeInTheDocument();
  });

  it('renders report details with normal data', () => {
    const mockReport = createMockJobReportDetails({
      jobTitle: 'Lead AI Architect',
      companyName: 'Enterprise AI Labs',
      status: 'Pending',
      reasonLabel: 'Misleading Information',
    });

    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: mockReport,
      isLoading: false,
    });

    render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText('Lead AI Architect')).toBeInTheDocument();
    expect(screen.getByText('Enterprise AI Labs')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Misleading Information')).toBeInTheDocument();
  });

  it('renders long reporter email address and verifies break-all class and min-w-0 on parent', () => {
    const longReporterEmail =
      'marufrahman.verylongemailaddressforthistestingpurpose.dev@gmail.com';
    const mockReport = createMockJobReportDetails({
      reporterEmail: longReporterEmail,
    });

    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: mockReport,
      isLoading: false,
    });

    render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const emailElement = screen.getByText(longReporterEmail);
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveClass('break-all');
    expect(emailElement.parentElement).toHaveClass('min-w-0');
  });

  it('renders fallback N/A when reporterEmail is undefined, null, or empty string', () => {
    const mockReportWithoutEmail = createMockJobReportDetails({
      reporterEmail: undefined,
    });

    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: mockReportWithoutEmail,
      isLoading: false,
    });

    const { rerender } = render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const fallbackElement = screen.getByText('N/A');
    expect(fallbackElement).toBeInTheDocument();
    expect(fallbackElement).toHaveClass('break-all');
    expect(fallbackElement.parentElement).toHaveClass('min-w-0');

    const mockReportWithEmptyEmail = createMockJobReportDetails({
      reporterEmail: '',
    });
    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: mockReportWithEmptyEmail,
      isLoading: false,
    });

    rerender(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders Dismiss and Resolve Report buttons when status is Pending and opens respective dialogs on click', () => {
    const pendingReport = createMockJobReportDetails({
      status: 'Pending',
    });

    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: pendingReport,
      isLoading: false,
    });

    render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    const resolveButton = screen.getByRole('button', { name: 'Resolve Report' });

    expect(dismissButton).toBeInTheDocument();
    expect(resolveButton).toBeInTheDocument();

    expect(screen.queryByTestId('dismiss-dialog')).not.toBeInTheDocument();
    fireEvent.click(dismissButton);
    expect(screen.getByTestId('dismiss-dialog')).toBeInTheDocument();

    expect(screen.queryByTestId('resolve-dialog')).not.toBeInTheDocument();
    fireEvent.click(resolveButton);
    expect(screen.getByTestId('resolve-dialog')).toBeInTheDocument();
  });

  it('does not render action buttons when status is Resolved', () => {
    const resolvedReport = createMockJobReportDetails({
      status: 'Resolved',
    });

    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: resolvedReport,
      isLoading: false,
    });

    render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Resolve Report' })
    ).not.toBeInTheDocument();
  });

  it('does not render action buttons when status is Dismissed', () => {
    const dismissedReport = createMockJobReportDetails({
      status: 'Dismissed',
    });

    (useJobReportDetails as jest.Mock).mockReturnValue({
      data: dismissedReport,
      isLoading: false,
    });

    render(
      <JobReportDetailDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Resolve Report' })
    ).not.toBeInTheDocument();
  });
});
