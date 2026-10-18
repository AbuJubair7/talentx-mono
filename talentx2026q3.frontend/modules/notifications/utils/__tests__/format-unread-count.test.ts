import { NOTIFICATION_CONSTANTS } from '../../constants';
import { formatUnreadCount } from '../format-unread-count';

describe('formatUnreadCount', () => {
  it('returns empty string when unread count is zero', () => {
    const formattedResult = formatUnreadCount(0);
    expect(formattedResult).toBe('');
  });

  it('returns empty string when unread count is negative', () => {
    const formattedNegativeOne = formatUnreadCount(-1);
    const formattedNegativeTen = formatUnreadCount(-10);

    expect(formattedNegativeOne).toBe('');
    expect(formattedNegativeTen).toBe('');
  });

  it('returns string representation when count is between 1 and maximum display limit', () => {
    expect(formatUnreadCount(1)).toBe('1');
    expect(formatUnreadCount(5)).toBe('5');
    expect(formatUnreadCount(42)).toBe('42');
    expect(formatUnreadCount(NOTIFICATION_CONSTANTS.MAX_UNREAD_COUNT_DISPLAY)).toBe('99');
  });

  it('returns capped representation with plus sign when count exceeds maximum display limit', () => {
    expect(formatUnreadCount(100)).toBe('99+');
    expect(formatUnreadCount(150)).toBe('99+');
    expect(formatUnreadCount(999)).toBe('99+');
    expect(formatUnreadCount(10000)).toBe('99+');
  });

  it('returns empty string when unread count is not a finite number or is NaN', () => {
    expect(formatUnreadCount(NaN)).toBe('');
    expect(formatUnreadCount(Infinity)).toBe('');
    expect(formatUnreadCount(-Infinity)).toBe('');
    expect(formatUnreadCount(undefined as unknown as number)).toBe('');
    expect(formatUnreadCount(null as unknown as number)).toBe('');
  });

  it('normalizes fractional counts by flooring to integer', () => {
    expect(formatUnreadCount(0.5)).toBe('');
    expect(formatUnreadCount(3.2)).toBe('3');
    expect(formatUnreadCount(3.8)).toBe('3');
    expect(formatUnreadCount(99.4)).toBe('99');
    expect(formatUnreadCount(99.9)).toBe('99');
    expect(formatUnreadCount(100.5)).toBe('99+');
  });
});
