import { timeAgo } from '@/lib/time'

const isoMsAgo = (ms: number) => new Date(Date.now() - ms).toISOString()

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('timeAgo', () => {
  it('returns "just now" for very recent timestamps', () => {
    expect(timeAgo(isoMsAgo(5 * SECOND))).toBe('just now')
  })
  it('formats minutes', () => {
    expect(timeAgo(isoMsAgo(5 * MINUTE))).toBe('5m ago')
  })
  it('formats hours', () => {
    expect(timeAgo(isoMsAgo(3 * HOUR))).toBe('3h ago')
  })
  it('formats days', () => {
    expect(timeAgo(isoMsAgo(2 * DAY))).toBe('2d ago')
  })
  it('formats weeks', () => {
    expect(timeAgo(isoMsAgo(10 * DAY))).toBe('1w ago')
  })
  it('formats months', () => {
    expect(timeAgo(isoMsAgo(60 * DAY))).toBe('2mo ago')
  })
  it('accepts a Date object as well as a string', () => {
    expect(timeAgo(new Date(Date.now() - 2 * HOUR))).toBe('2h ago')
  })
  it('returns an empty string for an invalid date', () => {
    expect(timeAgo('not-a-date')).toBe('')
  })
  it('does not produce negative values for future dates', () => {
    const future = new Date(Date.now() + 5 * MINUTE).toISOString()
    expect(timeAgo(future)).toBe('just now')
  })
})