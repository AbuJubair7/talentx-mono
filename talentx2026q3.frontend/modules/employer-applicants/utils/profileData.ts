// Display-boundary guards for candidate-profile data: the API response is typed but never
// runtime-validated, so blank strings, null/undefined list entries, and non-finite numbers
// must never reach the JSX.

export function nonBlankText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function displayText(value: string | null | undefined, fallback: string): string {
  return nonBlankText(value) ?? fallback;
}

export function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function safeStringList(value: readonly unknown[] | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}

export function safeItemList<T>(value: readonly T[] | null | undefined): T[] {
  return Array.isArray(value) ? value.filter((item): item is T => item != null) : [];
}
