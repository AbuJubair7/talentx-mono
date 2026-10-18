'use client';

import type { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Notification } from '../types';
import {
  buildMatchingJobsUrl,
  buildEmployerVerificationUrl,
  buildEmployerDashboardUrl,
  buildReportedJobsUrl,
  buildJobModerationUrl,
  buildEmployerJobUrl,
  buildTalentInterviewsUrl,
  buildEmployerApplicantDetailUrl,
  buildJobInvitationUrl,
  parseNotificationMetadata,
  parseEmployerVerificationMetadata,
  parseJobReportMetadata,
  parseJobMetadata,
  parseInterviewMetadata,
  parseJobInvitationMetadata,
} from '../utils';
import {
  NOTIFICATION_TYPE_CONFIG,
  DEFAULT_NOTIFICATION_TYPE_CONFIG,
} from '../constants';

export interface NotificationListItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  isMarkingAsRead?: boolean;
}

export function NotificationListItem({
  notification,
  onMarkAsRead,
  isMarkingAsRead = false,
}: NotificationListItemProps) {
  const router = useRouter();
  const isUnread = notification.readAt === null;

  const clickThroughUrl = (() => {
    if (notification.type === 'InterviewInvitationReceived') {
      return buildTalentInterviewsUrl();
    }

    if (notification.type === 'InterviewInvitationAccepted') {
      return buildEmployerApplicantDetailUrl(
        parseInterviewMetadata(notification.metadata)
      );
    }

    if (notification.type === 'JobInvitationReceived') {
      return buildJobInvitationUrl(
        parseJobInvitationMetadata(notification.metadata)
      );
    }

    if (
      notification.type === 'EmployerRegistered' ||
      notification.type === 'EmployerReApplied'
    ) {
      const metadata = parseEmployerVerificationMetadata(notification.metadata);
      return metadata ? buildEmployerVerificationUrl(metadata) : null;
    }

    if (
      notification.type === 'EmployerApproved' ||
      notification.type === 'EmployerRejected'
    ) {
      return buildEmployerDashboardUrl();
    }

    if (notification.type === 'JobReported') {
      const metadata = parseJobReportMetadata(notification.metadata);
      return buildReportedJobsUrl(metadata);
    }

    if (
      notification.type === 'JobReportResolved' ||
      notification.type === 'JobDeactivated'
    ) {
      const metadata = parseJobMetadata(notification.metadata);
      return buildEmployerJobUrl(metadata, 'Deactivated');
    }

    if (notification.type === 'JobReactivated') {
      const metadata = parseJobMetadata(notification.metadata);
      return buildEmployerJobUrl(metadata, 'Active');
    }

    if (notification.type === 'JobResubmittedForReview') {
      const metadata = parseJobMetadata(notification.metadata);
      return buildJobModerationUrl(metadata);
    }

    const metadata = parseNotificationMetadata(notification.metadata);
    return metadata ? buildMatchingJobsUrl(metadata) : null;
  })();


  const handleActivate = () => {
    if (isUnread && !isMarkingAsRead) {
      onMarkAsRead(notification.id);
    }
    if (clickThroughUrl) {
      router.push(clickThroughUrl);
    }
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLLIElement>) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      handleActivate();
    }
  };

  const typeConfig =
    NOTIFICATION_TYPE_CONFIG[notification.type] ?? DEFAULT_NOTIFICATION_TYPE_CONFIG;
  const IconComponent = typeConfig.icon;

  return (
    <li
      data-testid="notification-list-item"
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      aria-label={
        isUnread
          ? `Mark "${notification.title}" as read`
          : `${notification.title} (already read)`
      }
      className={cn(
        'relative flex w-full items-start gap-3 p-3.5 sm:p-4 text-left border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 cursor-pointer transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 dark:focus-visible:ring-white',
        isUnread
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
          : 'bg-white dark:bg-slate-950'
      )}
    >
      <IconComponent className={typeConfig.iconClassName} aria-hidden="true" />

      <div className="flex-1 min-w-0 space-y-1">
        <h4
          className={cn(
            'text-xs sm:text-sm leading-snug line-clamp-2',
            isUnread
              ? 'font-bold text-slate-900 dark:text-white'
              : 'font-medium text-slate-700 dark:text-slate-300'
          )}
        >
          {notification.title}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
          {notification.body}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      {isUnread && (
        <span
          data-testid="notification-item-unread-dot"
          aria-hidden="true"
          className="size-2 shrink-0 mt-1 rounded-full bg-emerald-600"
        />
      )}
    </li>
  );
}
