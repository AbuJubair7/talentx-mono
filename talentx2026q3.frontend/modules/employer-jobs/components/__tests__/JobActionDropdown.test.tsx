import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { JobActionDropdown } from '../JobActionDropdown';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    error: (...parameters: unknown[]) => mockToastError(...parameters),
    success: (...parameters: unknown[]) => mockToastSuccess(...parameters),
  },
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DropdownMenuTrigger: ({
    children,
    ...restProperties
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement('button', restProperties, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => React.createElement('button', { onClick, className }, children),
  DropdownMenuLinkItem: ({
    children,
    href,
    className,
    ...restProperties
  }: {
    children: React.ReactNode;
    href?: string;
    className?: string;
    [key: string]: unknown;
  }) => React.createElement('a', { href, className, ...restProperties }, children),
  DropdownMenuSeparator: () => React.createElement('hr', null),
}));

describe('JobActionDropdown', () => {
  const defaultDropdownProps = {
    jobId: 'job-abc-123',
    jobTitle: 'Senior ML Engineer',
    jobStatus: 'Published' as const,
    onClose: jest.fn(),
    onDelete: jest.fn(),
    onReopen: jest.fn(),
    onPublish: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trigger button with accessible aria-label containing the job title and border styling', () => {
    render(<JobActionDropdown {...defaultDropdownProps} />);

    const triggerButton = screen.getByLabelText(`Job actions for ${defaultDropdownProps.jobTitle}`);
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveClass('size-8', 'rounded-md', 'border', 'border-slate-200/80', 'bg-slate-50/60');
  });

  describe('Draft status actions', () => {
    it('shows Publish and does not show Close Job or Reopen', () => {
      render(<JobActionDropdown {...defaultDropdownProps} jobStatus="Draft" />);

      expect(screen.getByText('Publish')).toBeInTheDocument();
      expect(screen.queryByText('Close Job')).not.toBeInTheDocument();
      expect(screen.queryByText('Reopen')).not.toBeInTheDocument();
    });

    it('shows Edit linking to the edit route', () => {
      render(<JobActionDropdown {...defaultDropdownProps} jobStatus="Draft" />);

      const editLink = screen.getByRole('link', { name: 'Edit' });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute('href', '/job/job-abc-123/edit');
    });

    it('calls onPublish with correct jobId when Publish is clicked', async () => {
      const user = userEvent.setup();
      const onPublishMock = jest.fn();

      render(
        <JobActionDropdown
          {...defaultDropdownProps}
          jobStatus="Draft"
          onPublish={onPublishMock}
        />
      );

      await user.click(screen.getByText('Publish'));
      expect(onPublishMock).toHaveBeenCalledWith('job-abc-123');
      expect(onPublishMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Published status actions', () => {
    it('shows Close Job and does not show Publish or Reopen', () => {
      render(<JobActionDropdown {...defaultDropdownProps} jobStatus="Published" />);

      expect(screen.getByText('Close Job')).toBeInTheDocument();
      expect(screen.queryByText('Publish')).not.toBeInTheDocument();
      expect(screen.queryByText('Reopen')).not.toBeInTheDocument();
    });

    it('calls onClose with correct jobId when Close Job is clicked', async () => {
      const user = userEvent.setup();
      const onCloseMock = jest.fn();

      render(
        <JobActionDropdown
          {...defaultDropdownProps}
          jobStatus="Published"
          onClose={onCloseMock}
        />
      );

      await user.click(screen.getByText('Close Job'));
      expect(onCloseMock).toHaveBeenCalledWith('job-abc-123');
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Closed status actions', () => {
    it('shows Reopen and allows Edit', () => {
      render(
        <JobActionDropdown
          {...defaultDropdownProps}
          jobStatus="Closed"
          expireAt="2030-01-01T00:00:00Z"
        />
      );

      expect(screen.getByText('Reopen')).toBeInTheDocument();
      const editLink = screen.getByRole('link', { name: 'Edit' });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute('href', '/job/job-abc-123/edit');
      expect(editLink).not.toHaveAttribute('aria-disabled');
    });

    it('does not show Close Job or Publish', () => {
      render(
        <JobActionDropdown
          {...defaultDropdownProps}
          jobStatus="Closed"
          expireAt="2030-01-01T00:00:00Z"
        />
      );

      expect(screen.queryByText('Close Job')).not.toBeInTheDocument();
      expect(screen.queryByText('Publish')).not.toBeInTheDocument();
    });

    it('calls onReopen when expireAt is in the future', async () => {
      const user = userEvent.setup();
      const onReopenMock = jest.fn();

      render(
        <JobActionDropdown
          {...defaultDropdownProps}
          jobStatus="Closed"
          expireAt="2035-12-31T23:59:59Z"
          onReopen={onReopenMock}
        />
      );

      await user.click(screen.getByText('Reopen'));
      expect(onReopenMock).toHaveBeenCalledWith('job-abc-123');
      expect(mockToastError).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('redirects to /job/:id/edit with deadline warning toast when expireAt is in the past', async () => {
      const user = userEvent.setup();
      const onReopenMock = jest.fn();

      render(
        <JobActionDropdown
          {...defaultDropdownProps}
          jobStatus="Closed"
          expireAt="2020-01-01T00:00:00Z"
          onReopen={onReopenMock}
        />
      );

      await user.click(screen.getByText('Reopen'));

      expect(mockToastError).toHaveBeenCalledWith(
        'Application deadline has passed. Please update the deadline before reopening.'
      );
      expect(mockPush).toHaveBeenCalledWith('/job/job-abc-123/edit');
      expect(onReopenMock).not.toHaveBeenCalled();
    });
  });

  describe('Expired status actions', () => {
    it('shows Edit & Re-publish and does not show standard Edit, Publish, Close Job, or Reopen', () => {
      render(<JobActionDropdown {...defaultDropdownProps} jobStatus="Expired" />);

      const republishLink = screen.getByRole('link', { name: 'Edit & Re-publish' });
      expect(republishLink).toBeInTheDocument();
      expect(republishLink).toHaveAttribute('href', '/job/job-abc-123/edit');

      expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
      expect(screen.queryByText('Publish')).not.toBeInTheDocument();
      expect(screen.queryByText('Close Job')).not.toBeInTheDocument();
      expect(screen.queryByText('Reopen')).not.toBeInTheDocument();
    });

    it('respects isExpired boolean flag even when status is not Expired string', () => {
      render(
        <JobActionDropdown
          {...defaultDropdownProps}
          jobStatus="Published"
          isExpired={true}
        />
      );

      expect(screen.getByRole('link', { name: 'Edit & Re-publish' })).toBeInTheDocument();
      expect(screen.queryByText('Close Job')).not.toBeInTheDocument();
    });
  });

  describe('Moderation status actions', () => {
    it('offers Fix & Resubmit and Delete for a deactivated job, but nothing the backend rejects', () => {
      render(<JobActionDropdown {...defaultDropdownProps} jobStatus="Deactivated" />);

      const resubmitLink = screen.getByRole('link', { name: 'Fix & Resubmit' });
      expect(resubmitLink).toHaveAttribute('href', '/job/job-abc-123/edit');
      expect(screen.getByText('Delete Job')).toBeInTheDocument();

      expect(screen.queryByText('Publish')).not.toBeInTheDocument();
      expect(screen.queryByText('Close Job')).not.toBeInTheDocument();
      expect(screen.queryByText('Reopen')).not.toBeInTheDocument();
    });

    it('keeps the moderation label when a deactivated job is also past its deadline', () => {
      render(<JobActionDropdown {...defaultDropdownProps} jobStatus="Deactivated" isExpired />);

      expect(screen.getByRole('link', { name: 'Fix & Resubmit' })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Edit & Re-publish' })).not.toBeInTheDocument();
    });

    it('leaves only View Details while an admin is reviewing the job', () => {
      render(<JobActionDropdown {...defaultDropdownProps} jobStatus="PendingReview" />);

      expect(screen.getByRole('link', { name: 'View Details' })).toBeInTheDocument();
      for (const action of ['Edit', 'Fix & Resubmit', 'Publish', 'Close Job', 'Reopen', 'Delete Job']) {
        expect(screen.queryByText(action)).not.toBeInTheDocument();
      }
    });
  });

  describe('Delete Job action across all statuses', () => {
    const allStatuses = ['Draft', 'Published', 'Closed', 'Expired'] as const;

    it.each(allStatuses)(
      'renders Delete Job and calls onDelete when clicked for %s status',
      async (status) => {
        const user = userEvent.setup();
        const onDeleteMock = jest.fn();

        render(
          <JobActionDropdown
            {...defaultDropdownProps}
            jobStatus={status}
            onDelete={onDeleteMock}
          />
        );

        const deleteButton = screen.getByText('Delete Job');
        expect(deleteButton).toBeInTheDocument();

        await user.click(deleteButton);
        expect(onDeleteMock).toHaveBeenCalledWith('job-abc-123');
        expect(onDeleteMock).toHaveBeenCalledTimes(1);
      }
    );
  });
});
