const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const SHORT_MONTH_YEAR_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  year: 'numeric',
};

const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const SHORT_DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
};

const SHORT_DATE_TIME_TZ_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZoneName: 'short',
};

export function formatDate(
  dateStr: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = SHORT_DATE_FORMAT,
  fallback = 'N/A',
): string {
  if (!dateStr) return fallback;
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (Number.isNaN(date.getTime())) return fallback;
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return fallback;
  }
}

export function formatShortDate(dateStr: string | Date | null | undefined, fallback = 'N/A'): string {
  return formatDate(dateStr, SHORT_DATE_FORMAT, fallback);
}

export function formatMonthYear(dateStr: string | Date | null | undefined, fallback = 'Present'): string {
  return formatDate(dateStr, SHORT_MONTH_YEAR_FORMAT, fallback);
}

export function formatLongDate(dateStr: string | Date | null | undefined, fallback = 'N/A'): string {
  return formatDate(dateStr, LONG_DATE_FORMAT, fallback);
}

export function formatDateTime(dateStr: string | Date | null | undefined, fallback = 'N/A'): string {
  return formatDate(dateStr, SHORT_DATE_TIME_FORMAT, fallback);
}

export function formatDateTimeWithTz(dateStr: string | Date | null | undefined, fallback = 'N/A'): string {
  return formatDate(dateStr, SHORT_DATE_TIME_TZ_FORMAT, fallback);
}

export function formatTimeslotRange(
  startStr: string | Date | null | undefined,
  endStr: string | Date | null | undefined,
  fallback = 'N/A',
): string {
  if (!startStr) return fallback;
  try {
    const start = typeof startStr === 'string' ? new Date(startStr) : startStr;
    if (Number.isNaN(start.getTime())) return fallback;

    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const dayPart = dayFormatter.format(start);
    const startTimePart = timeFormatter.format(start);

    if (!endStr) {
      return `${dayPart} · ${startTimePart} (Your local time)`;
    }

    const end = typeof endStr === 'string' ? new Date(endStr) : endStr;
    if (Number.isNaN(end.getTime())) {
      return `${dayPart} · ${startTimePart} (Your local time)`;
    }

    const isSameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();

    const endTimePart = timeFormatter.format(end);

    if (isSameDay) {
      return `${dayPart} · ${startTimePart} – ${endTimePart} (Your local time)`;
    }

    const endDayPart = dayFormatter.format(end);
    return `${dayPart}, ${startTimePart} – ${endDayPart}, ${endTimePart} (Your local time)`;
  } catch {
    return fallback;
  }
}

export function formatRelativeDay(
  dateStr: string | Date | null | undefined,
  now: Date = new Date(),
  fallback = 'N/A',
): string {
  if (!dateStr) return fallback;
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (Number.isNaN(date.getTime())) return fallback;
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000);
    return new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' }).format(diffDays, 'day');
  } catch {
    return fallback;
  }
}

export function isPast(dateStr: string | Date | null | undefined, now: Date = new Date()): boolean {
  if (!dateStr) return false;
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < now.getTime();
}

export function timeUntil(
  dateStr: string | Date | null | undefined,
  now: Date = new Date(),
  fallback = 'N/A',
): string {
  if (!dateStr) return fallback;
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (Number.isNaN(date.getTime())) return fallback;
    const mins = Math.floor((date.getTime() - now.getTime()) / 60_000);
    if (mins <= 0) return 'Started';
    const days = Math.floor(mins / 1440);
    const hours = Math.floor((mins % 1440) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  } catch {
    return fallback;
  }
}
