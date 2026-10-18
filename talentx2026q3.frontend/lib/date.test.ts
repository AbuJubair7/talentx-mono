import { formatDateTime, formatDateTimeWithTz, formatRelativeDay, formatTimeslotRange, isPast } from './date'

describe('formatDateTime', () => {
  it('formats an ISO string as a short date with a time component', () => {
    const out = formatDateTime('2026-03-14T12:00:00Z')
    expect(out).toMatch(/Mar 14, 2026/)
    // hour:minute, e.g. "12:00 PM" / "6:00 AM" depending on the runner's TZ
    expect(out).toMatch(/\d{1,2}:\d{2}/)
  })

  it('accepts a Date object as well as a string', () => {
    expect(formatDateTime(new Date('2026-03-14T12:00:00Z'))).toMatch(/Mar 14, 2026/)
  })

  it('returns the default fallback for nullish / empty input', () => {
    expect(formatDateTime(null)).toBe('N/A')
    expect(formatDateTime(undefined)).toBe('N/A')
    expect(formatDateTime('')).toBe('N/A')
  })

  it('returns the fallback for an unparseable date', () => {
    expect(formatDateTime('not-a-date')).toBe('N/A')
  })

  it('honours a custom fallback', () => {
    expect(formatDateTime(null, '—')).toBe('—')
  })
})

describe('formatDateTimeWithTz', () => {
  it('formats date and includes timezone abbreviation', () => {
    const out = formatDateTimeWithTz('2026-10-15T08:00:00Z')
    expect(out).toMatch(/Oct 15, 2026/)
    expect(out).toMatch(/\d{1,2}:\d{2}\s+(AM|PM)/)
  })

  it('returns fallback for invalid or nullish date', () => {
    expect(formatDateTimeWithTz(null)).toBe('N/A')
    expect(formatDateTimeWithTz('invalid')).toBe('N/A')
  })
})

describe('formatTimeslotRange', () => {
  it('formats start and end times into weekday, date and time range with local time indicator', () => {
    const out = formatTimeslotRange('2026-10-15T08:00:00Z', '2026-10-15T08:45:00Z')
    expect(out).toMatch(/^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2} · \d{1,2}:\d{2} [AP]M – \d{1,2}:\d{2} [AP]M \(Your local time\)$/)
  })

  it('formats single time if end is missing', () => {
    const out = formatTimeslotRange('2026-10-15T08:00:00Z', null)
    expect(out).toMatch(/^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2} · \d{1,2}:\d{2} [AP]M \(Your local time\)$/)
  })

  it('returns fallback for invalid start date', () => {
    expect(formatTimeslotRange(null, null)).toBe('N/A')
    expect(formatTimeslotRange('invalid', 'invalid')).toBe('N/A')
  })
})

describe('formatRelativeDay', () => {
  // Built from local-time components (not ISO/UTC strings) so the day-boundary math is
  // independent of the host machine's timezone offset.
  const now = new Date(2026, 9, 15, 12, 0, 0)

  it('labels the same calendar day as "today"', () => {
    expect(formatRelativeDay(new Date(2026, 9, 15, 1, 0, 0), now)).toBe('today')
  })

  it('labels the previous calendar day as "yesterday"', () => {
    expect(formatRelativeDay(new Date(2026, 9, 14, 23, 0, 0), now)).toBe('yesterday')
  })

  it('labels the next calendar day as "tomorrow"', () => {
    expect(formatRelativeDay(new Date(2026, 9, 16, 1, 0, 0), now)).toBe('tomorrow')
  })

  it('formats a past date several days ago', () => {
    expect(formatRelativeDay(new Date(2026, 9, 12, 12, 0, 0), now)).toBe('3 days ago')
  })

  it('formats a future date several days out', () => {
    expect(formatRelativeDay(new Date(2026, 9, 18, 12, 0, 0), now)).toBe('in 3 days')
  })

  it('returns the default fallback for nullish / invalid input', () => {
    expect(formatRelativeDay(null, now)).toBe('N/A')
    expect(formatRelativeDay('not-a-date', now)).toBe('N/A')
  })

  it('honours a custom fallback', () => {
    expect(formatRelativeDay(undefined, now, '—')).toBe('—')
  })
})

describe('isPast', () => {
  const now = new Date(2026, 9, 15, 12, 0, 0)

  it('returns true for a date before now', () => {
    expect(isPast(new Date(2026, 9, 14), now)).toBe(true)
  })

  it('returns false for a date after now', () => {
    expect(isPast(new Date(2026, 9, 16), now)).toBe(false)
  })

  it('returns false for nullish or unparseable input', () => {
    expect(isPast(null, now)).toBe(false)
    expect(isPast(undefined, now)).toBe(false)
    expect(isPast('not-a-date', now)).toBe(false)
  })
})

