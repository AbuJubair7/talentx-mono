import {
  formatDateTime as libFormatDateTime,
  formatDateTimeWithTz as libFormatDateTimeWithTz,
  formatShortDate as libFormatShortDate,
  formatTimeslotRange as libFormatTimeslotRange,
} from '@/lib/date';
import type { DisplayStatus, InterviewFilter, InterviewType, TalentInterviewDto } from '../types/interview.types';

export type { DisplayStatus, InterviewFilter };

export const modeLabel: Record<InterviewType, string> = {
  OnlineAssessment: 'Online assessment',
  OnSite: 'On-site',
  OnCall: 'Video call',
};

export function getInterviewScheduledDate(inv: TalentInterviewDto): string | null {
  if (inv.scheduledAt) return inv.scheduledAt;
  if (inv.assessmentDeadline) return inv.assessmentDeadline;
  if (inv.timeslots && inv.timeslots.length > 0) {
    const sorted = [...inv.timeslots].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    if (sorted[0]?.startTime) return sorted[0].startTime;
  }
  return null;
}

export function getInterviewWhen(inv: TalentInterviewDto): string {
  return getInterviewScheduledDate(inv) || inv.sentAt;
}

export function isPast(inv: TalentInterviewDto, now: Date = new Date()): boolean {
  if (inv.scheduledAt) {
    const t = new Date(inv.scheduledAt).getTime();
    return !Number.isNaN(t) && t < now.getTime();
  }
  if (inv.assessmentDeadline) {
    const t = new Date(inv.assessmentDeadline).getTime();
    return !Number.isNaN(t) && t < now.getTime();
  }
  if (inv.timeslots && inv.timeslots.length > 0) {
    // Not past until EVERY offered timeslot has passed — a still-future slot keeps the
    // invite (and its Accept/Decline actions) live even if an earlier slot already lapsed.
    return inv.timeslots.every((slot) => {
      const t = new Date(slot.startTime).getTime();
      return !Number.isNaN(t) && t < now.getTime();
    });
  }
  return false;
}

export function getDisplayStatus(inv: TalentInterviewDto, now: Date = new Date()): DisplayStatus {
  const past = isPast(inv, now);
  if (inv.status === 'Pending' && past) return 'expired';
  if (inv.status === 'Accepted' && past) return 'completed';
  if (inv.status === 'Pending') return 'pending';
  if (inv.status === 'Accepted') return 'accepted';
  if (inv.status === 'Declined') return 'declined';
  if (inv.status === 'Cancelled') return 'cancelled';
  return 'expired';
}

export function formatWhen(iso: string): string {
  return libFormatDateTime(iso);
}

export function formatTimeslotRange(
  startTime: string | Date | null | undefined,
  endTime: string | Date | null | undefined
): string {
  return libFormatTimeslotRange(startTime, endTime);
}

export function formatShortDate(iso: string): string {
  return libFormatShortDate(iso);
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    
    // Normalize to start of day for calendar day difference
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffMs = dStart.getTime() - nowStart.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days === 0) return d > now ? 'Today' : 'Earlier today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 1) return `In ${days} days`;
    return `${Math.abs(days)} days ago`;
  } catch {
    return '';
  }
}

export function toHref(value: string): string {
  return value.startsWith('http') ? value : `https://${value}`;
}

export function mapsHref(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function initials(name: string): string {
  if (!name) return 'TX';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
