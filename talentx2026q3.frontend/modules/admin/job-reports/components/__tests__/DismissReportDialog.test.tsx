import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DismissReportDialog } from '../DismissReportDialog';
import { useDismissJobReport } from '../../hooks/useDismissJobReport';

jest.mock('../../hooks/useDismissJobReport', () => ({
  useDismissJobReport: jest.fn(),
}));

describe('DismissReportDialog', () => {
  const mockMutate = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockOnDismissed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDismissJobReport as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders character counter initialized at 0 / 1000', () => {
    render(
      <DismissReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onDismissed={mockOnDismissed}
      />
    );

    expect(screen.getByText('0 / 1000')).toBeInTheDocument();
  });

  it('updates live character counter when typing in admin notes', () => {
    render(
      <DismissReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onDismissed={mockOnDismissed}
      />
    );

    const notesInput = screen.getByPlaceholderText('Why are you dismissing this report?');
    fireEvent.change(notesInput, { target: { value: 'Report investigated and found to be invalid.' } });

    expect(screen.getByText('44 / 1000')).toBeInTheDocument();
  });

  it('displays validation error when admin notes exceed 1000 characters', async () => {
    render(
      <DismissReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onDismissed={mockOnDismissed}
      />
    );

    const longNotes = 'c'.repeat(1001);
    const notesInput = screen.getByPlaceholderText('Why are you dismissing this report?');
    fireEvent.change(notesInput, { target: { value: longNotes } });

    const submitButton = screen.getByRole('button', { name: 'Dismiss Report' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Admin notes cannot exceed 1000 characters')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    render(
      <DismissReportDialog
        reportId="report-123"
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onDismissed={mockOnDismissed}
      />
    );

    const notesInput = screen.getByPlaceholderText('Why are you dismissing this report?');
    fireEvent.change(notesInput, { target: { value: 'Report dismissed after admin review.' } });

    const submitButton = screen.getByRole('button', { name: 'Dismiss Report' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          id: 'report-123',
          payload: {
            adminNotes: 'Report dismissed after admin review.',
          },
        },
        expect.any(Object)
      );
    });
  });
});
