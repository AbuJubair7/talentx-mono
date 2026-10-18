import { Briefcase, Bell, UserPlus, RotateCcw, CheckCircle, XCircle, Flag, ShieldAlert, Calendar, CalendarCheck, Mail, type LucideIcon } from 'lucide-react';
import type { NotificationType } from '../types';

export interface NotificationTypeConfig {
  icon: LucideIcon;
  iconClassName: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  NotificationTypeConfig
> = {
  JobAlertMatch: {
    icon: Briefcase,
    iconClassName: 'text-emerald-600 dark:text-emerald-400 size-4 shrink-0 mt-0.5',
  },
  EmployerRegistered: {
    icon: UserPlus,
    iconClassName: 'text-blue-600 dark:text-blue-400 size-4 shrink-0 mt-0.5',
  },
  EmployerReApplied: {
    icon: RotateCcw,
    iconClassName: 'text-amber-600 dark:text-amber-400 size-4 shrink-0 mt-0.5',
  },
  EmployerApproved: {
    icon: CheckCircle,
    iconClassName: 'text-emerald-600 dark:text-emerald-400 size-4 shrink-0 mt-0.5',
  },
  EmployerRejected: {
    icon: XCircle,
    iconClassName: 'text-red-600 dark:text-red-400 size-4 shrink-0 mt-0.5',
  },
  JobReported: {
    icon: Flag,
    iconClassName: 'text-rose-600 dark:text-rose-400 size-4 shrink-0 mt-0.5',
  },
  JobReportResolved: {
    icon: ShieldAlert,
    iconClassName: 'text-rose-600 dark:text-rose-400 size-4 shrink-0 mt-0.5',
  },
  JobReportDismissed: {
    icon: XCircle,
    iconClassName: 'text-slate-600 dark:text-slate-400 size-4 shrink-0 mt-0.5',
  },
  JobDeactivated: {
    icon: ShieldAlert,
    iconClassName: 'text-rose-600 dark:text-rose-400 size-4 shrink-0 mt-0.5',
  },
  JobReactivated: {
    icon: CheckCircle,
    iconClassName: 'text-emerald-600 dark:text-emerald-400 size-4 shrink-0 mt-0.5',
  },
  JobResubmittedForReview: {
    icon: RotateCcw,
    iconClassName: 'text-amber-600 dark:text-amber-400 size-4 shrink-0 mt-0.5',
  },
  InterviewInvitationReceived: {
    icon: Calendar,
    iconClassName: 'text-blue-600 dark:text-blue-400 size-4 shrink-0 mt-0.5',
  },
  InterviewInvitationAccepted: {
    icon: CalendarCheck,
    iconClassName: 'text-emerald-600 dark:text-emerald-400 size-4 shrink-0 mt-0.5',
  },
  JobInvitationReceived: {
    icon: Mail,
    iconClassName: 'text-purple-600 dark:text-purple-400 size-4 shrink-0 mt-0.5',
  },
};

export const DEFAULT_NOTIFICATION_TYPE_CONFIG: NotificationTypeConfig = {
  icon: Bell,
  iconClassName: 'text-slate-600 dark:text-slate-400 size-4 shrink-0 mt-0.5',
};
