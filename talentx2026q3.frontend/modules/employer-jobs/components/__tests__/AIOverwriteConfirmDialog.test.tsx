import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AIOverwriteConfirmDialog } from '../AIOverwriteConfirmDialog';

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

describe('AIOverwriteConfirmDialog', () => {
  const defaultDialogProps = {
    open: true,
    onOpenChange: jest.fn(),
    targetField: 'description' as const,
    isLoading: false,
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Target field configuration', () => {
    it('renders description overwrite title and description text correctly', () => {
      render(
        <AIOverwriteConfirmDialog
          {...defaultDialogProps}
          targetField="description"
        />
      );

      expect(
        screen.getByRole('heading', { name: 'Overwrite Job Description?' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Existing job description will be replaced with AI-generated content. This action cannot be undone. Do you wish to continue?'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Generate & Replace' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('renders requirements overwrite title and description text correctly', () => {
      render(
        <AIOverwriteConfirmDialog
          {...defaultDialogProps}
          targetField="requirements"
        />
      );

      expect(
        screen.getByRole('heading', { name: 'Overwrite Job Requirements?' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Existing job requirements will be replaced with AI-generated content. This action cannot be undone. Do you wish to continue?'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Generate & Replace' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('Interactions and loading state', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirmMock = jest.fn();

      render(
        <AIOverwriteConfirmDialog
          {...defaultDialogProps}
          onConfirm={onConfirmMock}
        />
      );

      const confirmButton = screen.getByRole('button', {
        name: 'Generate & Replace',
      });
      await user.click(confirmButton);
      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    it('calls onOpenChange(false) when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChangeMock = jest.fn();

      render(
        <AIOverwriteConfirmDialog
          {...defaultDialogProps}
          onOpenChange={onOpenChangeMock}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);
      expect(onOpenChangeMock).toHaveBeenCalledWith(false);
    });

    it('displays loading state and disables buttons when isLoading is true', () => {
      render(
        <AIOverwriteConfirmDialog
          {...defaultDialogProps}
          isLoading={true}
        />
      );

      const confirmButton = screen.getByRole('button', {
        name: 'Generating...',
      });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('does not render dialog content when open is false', () => {
      render(
        <AIOverwriteConfirmDialog
          {...defaultDialogProps}
          open={false}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
