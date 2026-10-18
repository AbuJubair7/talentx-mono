import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResolveReportDialog } from '../ResolveReportDialog';
import { useResolveJobReport } from '../../hooks/useResolveJobReport';

jest.mock('../../hooks/useResolveJobReport', () => ({
  useResolveJobReport: jest.fn(),
}));

describe('ResolveReportDialog', () => {
  const mockMutate = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockOnResolved = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useResolveJobReport as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders character counters initialized at 0 / 1000', () => {
    render(
      <ResolveReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onResolved={mockOnResolved}
      />
    );

    const counters = screen.getAllByText('0 / 1000');
    expect(counters).toHaveLength(2);
  });

  it('updates live character counters when typing in textareas', () => {
    render(
      <ResolveReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onResolved={mockOnResolved}
      />
    );

    const detailsInput = screen.getByPlaceholderText('Provide more details for the employer...');
    const detailsText = 'This job posting contains misleading salary information.';
    fireEvent.change(detailsInput, { target: { value: detailsText } });

    expect(screen.getByText(`${detailsText.length} / 1000`)).toBeInTheDocument();

    const notesInput = screen.getByPlaceholderText('Internal notes for other admins...');
    const notesText = 'Verified with recruiter.';
    fireEvent.change(notesInput, { target: { value: notesText } });

    expect(screen.getByText(`${notesText.length} / 1000`)).toBeInTheDocument();
  });

  it('displays validation error when details are less than 10 characters', async () => {
    render(
      <ResolveReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onResolved={mockOnResolved}
      />
    );

    const selectReason = screen.getByLabelText(/Deactivation Reason/i);
    fireEvent.change(selectReason, { target: { value: 'MisleadingInformation' } });

    const detailsInput = screen.getByPlaceholderText('Provide more details for the employer...');
    fireEvent.change(detailsInput, { target: { value: 'Short' } });

    const submitButton = screen.getByRole('button', { name: 'Resolve & Deactivate' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Details must be at least 10 characters')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('displays validation error when details exceed 1000 characters', async () => {
    render(
      <ResolveReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onResolved={mockOnResolved}
      />
    );

    const selectReason = screen.getByLabelText(/Deactivation Reason/i);
    fireEvent.change(selectReason, { target: { value: 'Spam' } });

    const longText = 'a'.repeat(1001);
    const detailsInput = screen.getByPlaceholderText('Provide more details for the employer...');
    fireEvent.change(detailsInput, { target: { value: longText } });

    const submitButton = screen.getByRole('button', { name: 'Resolve & Deactivate' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Details cannot exceed 1000 characters')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('displays validation error when admin notes exceed 1000 characters', async () => {
    render(
      <ResolveReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onResolved={mockOnResolved}
      />
    );

    const selectReason = screen.getByLabelText(/Deactivation Reason/i);
    fireEvent.change(selectReason, { target: { value: 'Spam' } });

    const detailsInput = screen.getByPlaceholderText('Provide more details for the employer...');
    fireEvent.change(detailsInput, { target: { value: 'Valid details over ten characters' } });

    const longNotes = 'b'.repeat(1001);
    const notesInput = screen.getByPlaceholderText('Internal notes for other admins...');
    fireEvent.change(notesInput, { target: { value: longNotes } });

    const submitButton = screen.getByRole('button', { name: 'Resolve & Deactivate' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Admin notes cannot exceed 1000 characters')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    render(
      <ResolveReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onResolved={mockOnResolved}
      />
    );

    const selectReason = screen.getByLabelText(/Deactivation Reason/i);
    fireEvent.change(selectReason, { target: { value: 'Spam' } });

    const detailsInput = screen.getByPlaceholderText('Provide more details for the employer...');
    fireEvent.change(detailsInput, { target: { value: 'This job is spam content.' } });

    const notesInput = screen.getByPlaceholderText('Internal notes for other admins...');
    fireEvent.change(notesInput, { target: { value: 'Internal review completed.' } });

    const submitButton = screen.getByRole('button', { name: 'Resolve & Deactivate' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          id: 'report-123',
          payload: {
            deactivationReason: 'Spam',
            details: 'This job is spam content.',
            adminNotes: 'Internal review completed.',
          },
        },
        expect.any(Object)
      );
    });
  });
});
