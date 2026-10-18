// Converts an ISO timestamp (e.g. the backend's createdAt) into a short
// relative string like "2h ago" or "3d ago". Compute this at render time —
// never store a relative string in data, since it goes stale immediately.

export function timeAgo(isoDate: string | Date | null | undefined): string {
  if (!isoDate) return ''            // ← handles undefined/null from the API
  const then = typeof isoDate === 'string' ? new Date(isoDate) : isoDate
  const thenMs = then.getTime()
  if (Number.isNaN(thenMs)) return ''
  // ...rest unchanged

  const diffMs = Math.max(0, Date.now() - thenMs)
  const sec = Math.floor(diffMs / 1000)

  if (sec < 60) return 'just now'

  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`

  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`

  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`

  const week = Math.floor(day / 7)
  if (week < 5) return `${week}w ago`

  const month = Math.floor(day / 30)
  if (month < 12) return `${month}mo ago`

  const year = Math.floor(day / 365)
  return `${year}y ago`
}