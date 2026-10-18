import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { JobActionConfirmDialog } from '../JobActionConfirmDialog';
import type { JobActionIntent } from '../../types/employer-job.types';

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) =>
    open ? React.createElement('div', { role: 'dialog' }, children) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', null, children),
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement('p', null, children),
  DialogClose: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => React.createElement('button', { onClick, disabled, className }, children),
}));

describe('JobActionConfirmDialog', () => {
  const defaultDialogProps = {
    open: true,
    onOpenChange: jest.fn(),
    jobTitle: 'Frontend Architect',
    intent: 'close' as JobActionIntent,
    isPending: false,
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dialog intents configuration', () => {
    it('renders close intent with proper title, description, and button label', () => {
      render(<JobActionConfirmDialog {...defaultDialogProps} intent="close" />);

      expect(screen.getByRole('heading', { name: 'Close Job' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Closing "Frontend Architect" will remove it from public listings. Are you sure?'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close Job' })).toBeInTheDocument();
    });

    it('renders delete intent with warning description and destructive button style', () => {
      render(<JobActionConfirmDialog {...defaultDialogProps} intent="delete" />);

      expect(screen.getByRole('heading', { name: 'Delete Job' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Deleting "Frontend Architect" is permanent and cannot be undone. Are you sure?'
        )
      ).toBeInTheDocument();
      const deleteButton = screen.getByRole('button', { name: 'Delete Job' });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton.className).toContain('bg-rose-600');
    });

    it('renders reopen intent with reactivation description and emerald button style', () => {
      render(<JobActionConfirmDialog {...defaultDialogProps} intent="reopen" />);

      expect(screen.getByRole('heading', { name: 'Reopen Job' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Reopening "Frontend Architect" will make it live and start accepting candidate applications again.'
        )
      ).toBeInTheDocument();
      const reopenButton = screen.getByRole('button', { name: 'Reopen Job' });
      expect(reopenButton).toBeInTheDocument();
      expect(reopenButton.className).toContain('bg-emerald-600');
    });

    it('renders publish intent with visibility description and emerald button style', () => {
      render(<JobActionConfirmDialog {...defaultDialogProps} intent="publish" />);

      expect(screen.getByRole('heading', { name: 'Publish Job' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Publishing "Frontend Architect" will make it immediately visible to job seekers.'
        )
      ).toBeInTheDocument();
      const publishButton = screen.getByRole('button', { name: 'Publish Job' });
      expect(publishButton).toBeInTheDocument();
      expect(publishButton.className).toContain('bg-emerald-600');
    });
  });

  describe('Interactions and states', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirmMock = jest.fn();

      render(
        <JobActionConfirmDialog
          {...defaultDialogProps}
          onConfirm={onConfirmMock}
        />
      );

      const confirmButton = screen.getByRole('button', { name: 'Close Job' });
      await user.click(confirmButton);
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenChange(false) when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChangeMock = jest.fn();

      render(
        <JobActionConfirmDialog
          {...defaultDialogProps}
          onOpenChange={onOpenChangeMock}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });

    it('disables confirm button when isPending is true', () => {
      render(<JobActionConfirmDialog {...defaultDialogProps} isPending={true} />);

      const confirmButton = screen.getByRole('button', { name: 'Close Job' });
      expect(confirmButton).toBeDisabled();
    });

    it('does not render dialog content when open is false', () => {
      render(<JobActionConfirmDialog {...defaultDialogProps} open={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
