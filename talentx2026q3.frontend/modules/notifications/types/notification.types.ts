export type NotificationType =
  | 'JobAlertMatch'
  | 'EmployerRegistered'
  | 'EmployerReApplied'
  | 'EmployerApproved'
  | 'EmployerRejected'
  | 'JobReported'
  | 'JobReportResolved'
  | 'JobReportDismissed'
  | 'JobDeactivated'
  | 'JobReactivated'
  | 'JobResubmittedForReview'
  | 'InterviewInvitationReceived'
  | 'InterviewInvitationAccepted'
  | 'JobInvitationReceived';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface PaginatedNotificationList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetNotificationsQueryParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}
