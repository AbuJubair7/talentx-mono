import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationListItem } from '../NotificationListItem';
import type { Notification } from '../../types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('NotificationListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUnreadNotificationWithMatch: Notification = {
    id: 'notif-1',
    type: 'JobAlertMatch',
    title: 'New Job Alert Match',
    body: 'A new job matching "Senior Frontend Engineer" was posted.',
    metadata: JSON.stringify({
      keyword: 'Senior Frontend Engineer',
      location: 'Remote',
    }),
    readAt: null,
    createdAt: new Date().toISOString(),
  };

  const mockUnreadNotificationWithoutMatch: Notification = {
    id: 'notif-2',
    type: 'JobAlertMatch',
    title: 'General Notification',
    body: 'Your profile was viewed.',
    metadata: null,
    readAt: null,
    createdAt: new Date().toISOString(),
  };

  const mockReadNotificationWithMatch: Notification = {
    id: 'notif-3',
    type: 'JobAlertMatch',
    title: 'Previous Match Alert',
    body: 'Another job alert match description.',
    metadata: JSON.stringify({
      keyword: 'Staff Backend Engineer',
    }),
    readAt: '2026-09-17T09:00:00Z',
    createdAt: '2026-09-17T08:00:00Z',
  };

  const mockReadNotificationWithoutMatch: Notification = {
    id: 'notif-4',
    type: 'JobAlertMatch',
    title: 'Previous Notification',
    body: 'Generic read notification.',
    metadata: null,
    readAt: '2026-09-17T09:00:00Z',
    createdAt: '2026-09-17T08:00:00Z',
  };

  it('renders unread state styling, cursor-pointer, and unread dot when notification is unread', () => {
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const unreadDot = screen.getByTestId('notification-item-unread-dot');
    expect(unreadDot).toBeInTheDocument();
    expect(unreadDot).toHaveClass('bg-emerald-600', 'rounded-full');

    const listItem = screen.getByTestId('notification-list-item');
    expect(listItem).toHaveClass('bg-emerald-50/60', 'cursor-pointer', 'hover:bg-slate-100/80');

    const buttonRole = screen.getByRole('button', {
      name: `Mark "${mockUnreadNotificationWithMatch.title}" as read`,
    });
    expect(buttonRole).toBeInTheDocument();
    expect(buttonRole).toHaveClass('focus-visible:ring-slate-900');
  });

  it('renders read state styling without unread dot when notification is already read', () => {
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockReadNotificationWithoutMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    expect(
      screen.queryByTestId('notification-item-unread-dot')
    ).not.toBeInTheDocument();

    const listItem = screen.getByTestId('notification-list-item');
    expect(listItem).not.toHaveClass('bg-emerald-50/60');
    expect(listItem).toHaveClass('bg-white', 'cursor-pointer', 'hover:bg-slate-100/80');

    const buttonRole = screen.getByRole('button', {
      name: `${mockReadNotificationWithoutMatch.title} (already read)`,
    });
    expect(buttonRole).toBeInTheDocument();
  });

  it('invokes onMarkAsRead and navigates to matchingJobsUrl when clicking an unread item with matching metadata', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    await userInteraction.click(listItem);

    expect(handleMarkAsRead).toHaveBeenCalledTimes(1);
    expect(handleMarkAsRead).toHaveBeenCalledWith('notif-1');
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      '/jobs?keyword=Senior+Frontend+Engineer&location=Remote'
    );
  });

  it('invokes onMarkAsRead without navigating when clicking an unread item without matchingJobsUrl', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithoutMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    await userInteraction.click(listItem);

    expect(handleMarkAsRead).toHaveBeenCalledTimes(1);
    expect(handleMarkAsRead).toHaveBeenCalledWith('notif-2');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not invoke onMarkAsRead but navigates to matchingJobsUrl when clicking an already read item', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockReadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    await userInteraction.click(listItem);

    expect(handleMarkAsRead).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/jobs?keyword=Staff+Backend+Engineer');
  });

  it('does not invoke onMarkAsRead when isMarkingAsRead is true, but still navigates if matchingJobsUrl is present', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
        isMarkingAsRead={true}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    await userInteraction.click(listItem);

    expect(handleMarkAsRead).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      '/jobs?keyword=Senior+Frontend+Engineer&location=Remote'
    );
  });

  it('does not render the separate "View Matching Jobs" link or text', () => {
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    expect(
      screen.queryByRole('link', { name: /View Matching Jobs/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/View Matching Jobs/i)).not.toBeInTheDocument();
  });

  it('activates mark-as-read and navigates to matchingJobsUrl when pressing Enter key', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    listItem.focus();
    expect(listItem).toHaveFocus();

    await userInteraction.keyboard('{Enter}');

    expect(handleMarkAsRead).toHaveBeenCalledTimes(1);
    expect(handleMarkAsRead).toHaveBeenCalledWith('notif-1');
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      '/jobs?keyword=Senior+Frontend+Engineer&location=Remote'
    );
  });

  it('activates mark-as-read and navigates to matchingJobsUrl when pressing Space key', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    listItem.focus();
    expect(listItem).toHaveFocus();

    await userInteraction.keyboard(' ');

    expect(handleMarkAsRead).toHaveBeenCalledTimes(1);
    expect(handleMarkAsRead).toHaveBeenCalledWith('notif-1');
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      '/jobs?keyword=Senior+Frontend+Engineer&location=Remote'
    );
  });

  it('has cursor-pointer and hover styling classes for interactive feedback', () => {
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    expect(listItem).toHaveClass(
      'cursor-pointer',
      'hover:bg-slate-100/80',
      'dark:hover:bg-slate-800/80',
      'transition-colors'
    );
  });

  it('handles malformed JSON in metadata gracefully without throwing', () => {
    const handleMarkAsRead = jest.fn();

    expect(() => {
      render(
        <NotificationListItem
          notification={{
            ...mockUnreadNotificationWithMatch,
            metadata: 'not-valid-json{[[',
          }}
          onMarkAsRead={handleMarkAsRead}
        />
      );
    }).not.toThrow();

    expect(
      screen.queryByRole('link', { name: /View Matching Jobs/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(mockUnreadNotificationWithMatch.title)
    ).toBeInTheDocument();
  });

  it('handles primitive or non-object JSON metadata without crashing', () => {
    const handleMarkAsRead = jest.fn();

    render(
      <NotificationListItem
        notification={{
          ...mockUnreadNotificationWithMatch,
          metadata: '12345',
        }}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    expect(
      screen.queryByRole('link', { name: /View Matching Jobs/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(mockUnreadNotificationWithMatch.title)
    ).toBeInTheDocument();
  });

  it('renders the JobAlertMatch notification with the Job Briefcase icon styling', () => {
    const handleMarkAsRead = jest.fn();

    const { container } = render(
      <NotificationListItem
        notification={mockUnreadNotificationWithMatch}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const iconElement = container.querySelector('svg.text-emerald-600');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders JobReportResolved notification with ShieldAlert icon and "Job Deactivated" title when job is deactivated', () => {
    const handleMarkAsRead = jest.fn();
    const jobDeactivatedNotification: Notification = {
      id: 'notif-report-resolved-deactivated',
      type: 'JobReportResolved',
      title: 'Resolved',
      body: 'Your job listing "Staff AI Engineer" was deactivated following a community report.',
      metadata: JSON.stringify({ jobId: 'job-123', reportId: 'rep-456' }),
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    const { container } = render(
      <NotificationListItem
        notification={jobDeactivatedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const titleElement = screen.getByText('Resolved');
    expect(titleElement).toBeInTheDocument();

    const iconElement = container.querySelector('svg.text-rose-600');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders JobReportResolved notification with ShieldAlert icon and renders notification title directly', () => {
    const handleMarkAsRead = jest.fn();
    const reportReviewedNotification: Notification = {
      id: 'notif-report-resolved-reviewed',
      type: 'JobReportResolved',
      title: 'Resolved',
      body: 'The report on your job listing "Staff AI Engineer" has been reviewed and closed.',
      metadata: JSON.stringify({ jobId: 'job-123', reportId: 'rep-789' }),
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    render(
      <NotificationListItem
        notification={reportReviewedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const titleElement = screen.getByText('Resolved');
    expect(titleElement).toBeInTheDocument();
  });

  it('navigates to specific deactivated job details page when clicking a JobReportResolved notification with jobId', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();
    const jobDeactivatedNotification: Notification = {
      id: 'notif-report-resolved-deactivated',
      type: 'JobReportResolved',
      title: 'Job Deactivated',
      body: 'Your job listing "Staff AI Engineer" was deactivated following a community report.',
      metadata: JSON.stringify({ jobId: 'job-123', reportId: 'rep-456' }),
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    render(
      <NotificationListItem
        notification={jobDeactivatedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    await userInteraction.click(listItem);

    expect(handleMarkAsRead).toHaveBeenCalledWith('notif-report-resolved-deactivated');
    expect(mockPush).toHaveBeenCalledWith('/job/job-listing/job-123');
  });

  it('navigates to specific deactivated job details page when metadata is a raw jobId string', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();
    const jobDeactivatedNotification: Notification = {
      id: 'notif-raw-guid',
      type: 'JobReportResolved',
      title: 'Job Deactivated',
      body: 'Your job listing was deactivated.',
      metadata: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    render(
      <NotificationListItem
        notification={jobDeactivatedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    await userInteraction.click(listItem);

    expect(mockPush).toHaveBeenCalledWith('/job/job-listing/a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  });

  it('navigates to deactivated jobs listing filter when clicking a JobReportResolved notification without jobId metadata', async () => {
    const userInteraction = userEvent.setup();
    const handleMarkAsRead = jest.fn();
    const jobDeactivatedNotification: Notification = {
      id: 'notif-no-job-id',
      type: 'JobReportResolved',
      title: 'Job Deactivated',
      body: 'Your job was deactivated.',
      metadata: null,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    render(
      <NotificationListItem
        notification={jobDeactivatedNotification}
        onMarkAsRead={handleMarkAsRead}
      />
    );

    const listItem = screen.getByTestId('notification-list-item');
    await userInteraction.click(listItem);

    expect(mockPush).toHaveBeenCalledWith('/job/job-listing?status=Deactivated');
  });

  describe('job moderation notifications', () => {
    const buildModerationNotification = (
      type: Notification['type'],
      overrides: Partial<Notification> = {}
    ): Notification => ({
      id: `notif-${type}`,
      type,
      title: 'Moderation update',
      body: "Your job 'Senior Backend Engineer' was updated.",
      metadata: JSON.stringify({ jobId: 'job-123', jobTitle: 'Senior Backend Engineer' }),
      readAt: null,
      createdAt: new Date().toISOString(),
      ...overrides,
    });

    it.each([
      ['JobDeactivated', 'svg.text-rose-600'],
      ['JobReactivated', 'svg.text-emerald-600'],
      ['JobResubmittedForReview', 'svg.text-amber-600'],
    ] as const)('renders the %s notification with its own icon colour', (type, iconSelector) => {
      const { container } = render(
        <NotificationListItem
          notification={buildModerationNotification(type)}
          onMarkAsRead={jest.fn()}
        />
      );

      expect(screen.getByText('Moderation update')).toBeInTheDocument();
      const icon = container.querySelector(iconSelector);
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it.each(['JobDeactivated', 'JobReactivated'] as const)(
      'marks a %s notification as read and opens the employer job page',
      async (type) => {
        const userInteraction = userEvent.setup();
        const handleMarkAsRead = jest.fn();

        render(
          <NotificationListItem
            notification={buildModerationNotification(type)}
            onMarkAsRead={handleMarkAsRead}
          />
        );

        await userInteraction.click(screen.getByTestId('notification-list-item'));

        expect(handleMarkAsRead).toHaveBeenCalledWith(`notif-${type}`);
        expect(mockPush).toHaveBeenCalledWith('/job/job-listing/job-123');
      }
    );

    it('falls back to the deactivated jobs filter when a JobDeactivated notification has no metadata', async () => {
      const userInteraction = userEvent.setup();

      render(
        <NotificationListItem
          notification={buildModerationNotification('JobDeactivated', { metadata: null })}
          onMarkAsRead={jest.fn()}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(mockPush).toHaveBeenCalledWith('/job/job-listing?status=Deactivated');
    });

    it('falls back to the active jobs filter when a JobReactivated notification has no metadata', async () => {
      const userInteraction = userEvent.setup();

      render(
        <NotificationListItem
          notification={buildModerationNotification('JobReactivated', { metadata: null })}
          onMarkAsRead={jest.fn()}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(mockPush).toHaveBeenCalledWith('/job/job-listing?status=Active');
    });

    it("opens that job's detail dialog on the admin moderation page when clicking a JobResubmittedForReview notification", async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      render(
        <NotificationListItem
          notification={buildModerationNotification('JobResubmittedForReview')}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-JobResubmittedForReview');
      expect(mockPush).toHaveBeenCalledWith('/admin/jobs?job=job-123');
    });

    it('opens the plain admin moderation list when a JobResubmittedForReview notification has no metadata', async () => {
      const userInteraction = userEvent.setup();

      render(
        <NotificationListItem
          notification={buildModerationNotification('JobResubmittedForReview', { metadata: null })}
          onMarkAsRead={jest.fn()}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(mockPush).toHaveBeenCalledWith('/admin/jobs');
    });

    it('does not mark an already read JobResubmittedForReview notification as read again but still navigates', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      render(
        <NotificationListItem
          notification={buildModerationNotification('JobResubmittedForReview', {
            readAt: '2026-09-25T09:00:00Z',
          })}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/admin/jobs?job=job-123');
    });
  });

  describe('interview notifications', () => {
    it('renders InterviewInvitationReceived with the calendar icon and clicks through to /interviews', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const interviewInvitationNotification: Notification = {
        id: 'notif-interview-received',
        type: 'InterviewInvitationReceived',
        title: 'Interview Invitation',
        body: 'You have received an interview invitation from Acme Corp.',
        metadata: JSON.stringify({
          invitationId: 'inv-123',
          jobId: 'job-456',
          jobTitle: 'Senior Frontend Engineer',
          companyName: 'Acme Corp',
        }),
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <NotificationListItem
          notification={interviewInvitationNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      expect(screen.getByText('Interview Invitation')).toBeInTheDocument();
      const calendarIcon = container.querySelector('svg.text-blue-600');
      expect(calendarIcon).toBeInTheDocument();
      expect(calendarIcon).toHaveAttribute('aria-hidden', 'true');

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-interview-received');
      expect(mockPush).toHaveBeenCalledWith('/interviews');
    });

    it('navigates to /interviews without marking as read when InterviewInvitationReceived is already read', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const readInterviewInvitationNotification: Notification = {
        id: 'notif-interview-received-read',
        type: 'InterviewInvitationReceived',
        title: 'Interview Invitation',
        body: 'You have received an interview invitation from Acme Corp.',
        metadata: null,
        readAt: '2026-10-01T10:00:00Z',
        createdAt: '2026-10-01T09:00:00Z',
      };

      render(
        <NotificationListItem
          notification={readInterviewInvitationNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/interviews');
    });

    it('renders InterviewInvitationAccepted with the calendar check icon and clicks through to applicant detail', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const interviewAcceptedNotification: Notification = {
        id: 'notif-interview-accepted',
        type: 'InterviewInvitationAccepted',
        title: 'Interview Accepted',
        body: 'Jane Doe accepted the interview invitation for Senior Frontend Engineer.',
        metadata: JSON.stringify({
          invitationId: 'inv-123',
          jobId: 'job-456',
          applicationId: 'app-789',
          candidateName: 'Jane Doe',
          jobTitle: 'Senior Frontend Engineer',
        }),
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <NotificationListItem
          notification={interviewAcceptedNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      expect(screen.getByText('Interview Accepted')).toBeInTheDocument();
      const calendarCheckIcon = container.querySelector('svg.text-emerald-600');
      expect(calendarCheckIcon).toBeInTheDocument();
      expect(calendarCheckIcon).toHaveAttribute('aria-hidden', 'true');

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-interview-accepted');
      expect(mockPush).toHaveBeenCalledWith('/job/job-listing/job-456/applicants/app-789');
    });

    it('clicks through to employer job page when InterviewInvitationAccepted only contains jobId', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const interviewAcceptedNotification: Notification = {
        id: 'notif-interview-accepted-job-only',
        type: 'InterviewInvitationAccepted',
        title: 'Interview Accepted',
        body: 'Candidate accepted interview invitation.',
        metadata: JSON.stringify({
          jobId: 'job-456',
        }),
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      render(
        <NotificationListItem
          notification={interviewAcceptedNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-interview-accepted-job-only');
      expect(mockPush).toHaveBeenCalledWith('/job/job-listing/job-456');
    });

    it('falls back to job listing URL when InterviewInvitationAccepted has no metadata', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const interviewAcceptedNotification: Notification = {
        id: 'notif-interview-accepted-no-metadata',
        type: 'InterviewInvitationAccepted',
        title: 'Interview Accepted',
        body: 'Candidate accepted interview invitation.',
        metadata: null,
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      render(
        <NotificationListItem
          notification={interviewAcceptedNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-interview-accepted-no-metadata');
      expect(mockPush).toHaveBeenCalledWith('/job/job-listing');
    });

    it('renders JobInvitationReceived with Mail icon and routes to job page with invitation token', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const jobInvitationNotification: Notification = {
        id: 'notif-job-invitation-1',
        type: 'JobInvitationReceived',
        title: 'Job Invitation',
        body: 'Acme Corp invited you to apply for Senior AI Engineer.',
        metadata: JSON.stringify({
          invitationId: 'inv-101',
          jobId: 'job-555',
          jobTitle: 'Senior AI Engineer',
          companyName: 'Acme Corp',
          token: 'token-xyz-789',
        }),
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      const { container } = render(
        <NotificationListItem
          notification={jobInvitationNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      expect(screen.getByText('Job Invitation')).toBeInTheDocument();
      const mailIcon = container.querySelector('svg.text-purple-600');
      expect(mailIcon).toBeInTheDocument();
      expect(mailIcon).toHaveAttribute('aria-hidden', 'true');

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-job-invitation-1');
      expect(mockPush).toHaveBeenCalledWith('/jobs/job-555?invitation=token-xyz-789');
    });

    it('routes JobInvitationReceived to job page when metadata has jobId without token', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const jobInvitationNotification: Notification = {
        id: 'notif-job-invitation-job-only',
        type: 'JobInvitationReceived',
        title: 'Job Invitation',
        body: 'You were invited to apply.',
        metadata: JSON.stringify({
          jobId: 'job-555',
        }),
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      render(
        <NotificationListItem
          notification={jobInvitationNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-job-invitation-job-only');
      expect(mockPush).toHaveBeenCalledWith('/jobs/job-555');
    });

    it('falls back to /jobs for JobInvitationReceived when metadata is null', async () => {
      const userInteraction = userEvent.setup();
      const handleMarkAsRead = jest.fn();

      const jobInvitationNotification: Notification = {
        id: 'notif-job-invitation-null',
        type: 'JobInvitationReceived',
        title: 'Job Invitation',
        body: 'You were invited to apply.',
        metadata: null,
        readAt: null,
        createdAt: new Date().toISOString(),
      };

      render(
        <NotificationListItem
          notification={jobInvitationNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      );

      await userInteraction.click(screen.getByTestId('notification-list-item'));

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-job-invitation-null');
      expect(mockPush).toHaveBeenCalledWith('/jobs');
    });
  });
});

