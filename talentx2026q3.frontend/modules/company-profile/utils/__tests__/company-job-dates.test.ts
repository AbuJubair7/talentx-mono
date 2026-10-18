import {
  CLOSING_SOON_DAYS,
  NEW_JOB_DAYS,
  formatPostedAgo,
  getClosingInfo,
  isNewJob,
} from '../company-job-dates';

const DAY_MS = 86_400_000;
const NOW = new Date('2026-09-26T12:00:00+06:00');

function isoDaysFromNow(days: number): string {
  return new Date(NOW.getTime() + days * DAY_MS).toISOString();
}

describe('formatPostedAgo', () => {
  it.each([
    [0, 'Today'],
    [1, 'Yesterday'],
    [3, '3 days ago'],
    [6, '6 days ago'],
    [7, '1 week ago'],
    [14, '2 weeks ago'],
    [30, '1 month ago'],
    [60, '2 months ago'],
    [365, '1 year ago'],
  ])('formats %i days ago correctly', (daysAgo, expected) => {
    expect(formatPostedAgo(isoDaysFromNow(-daysAgo), NOW)).toBe(expected);
  });

  it('returns null for missing, invalid, or future dates', () => {
    expect(formatPostedAgo(null, NOW)).toBeNull();
    expect(formatPostedAgo(undefined, NOW)).toBeNull();
    expect(formatPostedAgo('not-a-date', NOW)).toBeNull();
    expect(formatPostedAgo(isoDaysFromNow(1), NOW)).toBeNull();
  });
});

describe('isNewJob', () => {
  it(`is true within ${NEW_JOB_DAYS} days and false after`, () => {
    expect(isNewJob(isoDaysFromNow(0), NOW)).toBe(true);
    expect(isNewJob(isoDaysFromNow(-(NEW_JOB_DAYS - 1)), NOW)).toBe(true);
    expect(isNewJob(isoDaysFromNow(-NEW_JOB_DAYS), NOW)).toBe(false);
    expect(isNewJob(isoDaysFromNow(-30), NOW)).toBe(false);
  });

  it('returns false for missing, invalid, or future dates', () => {
    expect(isNewJob(null, NOW)).toBe(false);
    expect(isNewJob('garbage', NOW)).toBe(false);
    expect(isNewJob(isoDaysFromNow(2), NOW)).toBe(false);
  });
});

describe('getClosingInfo', () => {
  it('labels today and tomorrow as urgent', () => {
    expect(getClosingInfo(isoDaysFromNow(0), NOW)).toMatchObject({
      label: 'Closes today',
      urgent: true,
    });
    expect(getClosingInfo(isoDaysFromNow(1), NOW)).toMatchObject({
      label: 'Closes tomorrow',
      urgent: true,
    });
  });

  it(`marks deadlines within ${CLOSING_SOON_DAYS} days as urgent`, () => {
    expect(getClosingInfo(isoDaysFromNow(4), NOW)).toMatchObject({
      label: 'Closes in 4 days',
      urgent: true,
    });
    expect(getClosingInfo(isoDaysFromNow(CLOSING_SOON_DAYS), NOW)).toMatchObject({
      urgent: true,
    });
    expect(getClosingInfo(isoDaysFromNow(CLOSING_SOON_DAYS + 1), NOW)).toMatchObject({
      label: `Closes in ${CLOSING_SOON_DAYS + 1} days`,
      urgent: false,
    });
  });

  it('includes a short calendar date label', () => {
    const info = getClosingInfo(isoDaysFromNow(4), NOW);
    expect(info?.dateLabel).toBe(
      new Date(isoDaysFromNow(4)).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    );
  });

  it('returns null for missing, invalid, or past deadlines', () => {
    expect(getClosingInfo(null, NOW)).toBeNull();
    expect(getClosingInfo(undefined, NOW)).toBeNull();
    expect(getClosingInfo('nope', NOW)).toBeNull();
    expect(getClosingInfo(isoDaysFromNow(-1), NOW)).toBeNull();
  });
});
