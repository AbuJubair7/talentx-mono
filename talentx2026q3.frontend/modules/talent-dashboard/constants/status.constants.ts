import type { ElementType } from 'react';
import { CheckCircle2, Eye, Mail, MessageSquare, Star, XCircle } from 'lucide-react';
import type { ApplicationStatus } from '../types';

export interface StatusConfigItem {
  label: string;
  dot: string;
  text: string;
  Icon: ElementType;
}

export const STATUS_CONFIG: Partial<Record<ApplicationStatus, StatusConfigItem>> = {
  PendingVerification: {
    label: 'Pending Verification',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    Icon: Eye,
  },
  Applied: {
    label: 'Applied',
    dot: 'bg-slate-500',
    text: 'text-slate-600',
    Icon: CheckCircle2,
  },

  Interview: {
    label: 'Interview',
    dot: 'bg-orange-500',
    text: 'text-orange-600',
    Icon: MessageSquare,
  },
  Hired: {
    label: 'Hired',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    Icon: CheckCircle2,
  },
  Rejected: {
    label: 'Rejected',
    dot: 'bg-red-500',
    text: 'text-red-600',
    Icon: XCircle,
  },
  Invited: {
    label: 'Invited',
    dot: 'bg-indigo-500',
    text: 'text-indigo-600',
    Icon: Mail,
  },
  Shortlisted: {
    label: 'Shortlisted',
    dot: 'bg-teal-500',
    text: 'text-teal-600',
    Icon: Star,
  },
};

export const DEFAULT_STATUS_CONFIG: StatusConfigItem = {
  label: 'Applied',
  dot: 'bg-slate-400',
  text: 'text-slate-600',
  Icon: CheckCircle2,
};
