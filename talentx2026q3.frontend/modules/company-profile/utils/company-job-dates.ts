const DAY_MS = 86_400_000;

/** Jobs posted within this window get the "New" badge. */
export const NEW_JOB_DAYS = 7;

/** Deadlines within this window get the "Closing soon" badge. */
export const CLOSING_SOON_DAYS = 7;

function toDate(value?: string | null): Date | null {
  if (!value || typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(value: Date): Date {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Human-friendly posted age, e.g. "Today", "Yesterday", "3 days ago".
 * Returns null when the input is missing, invalid, or in the future.
 */
export function formatPostedAgo(publishedAt?: string | null, now: Date = new Date()): string | null {
  const published = toDate(publishedAt);
  if (!published) return null;
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(published).getTime()) / DAY_MS,
  );
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Whether the job counts as newly posted (published within NEW_JOB_DAYS).
 */
export function isNewJob(publishedAt?: string | null, now: Date = new Date()): boolean {
  const published = toDate(publishedAt);
  if (!published) return false;
  const diffMs = startOfDay(now).getTime() - startOfDay(published).getTime();
  return diffMs >= 0 && diffMs < NEW_JOB_DAYS * DAY_MS;
}

export interface ClosingInfo {
  /** e.g. "Closes today", "Closes tomorrow", "Closes in 4 days". */
  label: string;
  /** Short calendar date, e.g. "Oct 3". */
  dateLabel: string;
  /** True when the deadline is within CLOSING_SOON_DAYS. */
  urgent: boolean;
}

/**
 * Deadline info for a job expiry. Returns null when the input is missing,
 * invalid, or already past.
 */
export function getClosingInfo(
  expireAt?: string | null,
  now: Date = new Date(),
): ClosingInfo | null {
  const expiry = toDate(expireAt);
  if (!expiry) return null;
  const diffDays = Math.round(
    (startOfDay(expiry).getTime() - startOfDay(now).getTime()) / DAY_MS,
  );
  if (diffDays < 0) return null;
  const dateLabel = expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diffDays === 0) return { label: 'Closes today', dateLabel, urgent: true };
  if (diffDays === 1) return { label: 'Closes tomorrow', dateLabel, urgent: true };
  return {
    label: `Closes in ${diffDays} days`,
    dateLabel,
    urgent: diffDays <= CLOSING_SOON_DAYS,
  };
}
