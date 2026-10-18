export function formatDateSpan(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean
): string {
  const normalizedStartDate = startDate?.trim() || null
  const normalizedEndDate = endDate?.trim() || null

  if (isCurrent) {
    return normalizedStartDate ? `${normalizedStartDate} – Present` : "Present"
  }

  if (normalizedStartDate && normalizedEndDate) {
    return `${normalizedStartDate} – ${normalizedEndDate}`
  }

  if (normalizedStartDate) {
    return normalizedStartDate
  }

  if (normalizedEndDate) {
    return normalizedEndDate
  }

  return ""
}
