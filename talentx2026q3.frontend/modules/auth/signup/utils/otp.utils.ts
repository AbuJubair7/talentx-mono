/**
 * Strips all non-digit characters.
 */
export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Handles pasting multi-digit OTP codes into input boxes.
 */
export function processPastedOtp(
  pastedValue: string,
  startIndex: number,
  currentDigits: string[],
  maxLength = 6
): { newDigits: string[]; nextFocusIndex: number; isComplete: boolean } {
  const clean = sanitizeDigits(pastedValue).slice(0, maxLength).split('')
  const newDigits = [...currentDigits]

  clean.forEach((char, indexOffset) => {
    if (startIndex + indexOffset < maxLength) {
      newDigits[startIndex + indexOffset] = char
    }
  })

  const nextFocusIndex = Math.min(startIndex + clean.length, maxLength - 1)
  const isComplete = newDigits.every((digit) => digit !== '')

  return { newDigits, nextFocusIndex, isComplete }
}

/**
 * Handles typing a single digit and advancing focus.
 */
export function processSingleDigit(
  digitValue: string,
  currentIndex: number,
  currentDigits: string[],
  maxLength = 6
): { newDigits: string[]; nextFocusIndex: number | null; isComplete: boolean } {
  const cleanVal = sanitizeDigits(digitValue)
  const newDigits = [...currentDigits]
  newDigits[currentIndex] = cleanVal

  const nextFocusIndex = cleanVal && currentIndex < maxLength - 1 ? currentIndex + 1 : null
  const isComplete = newDigits.every((digit) => digit !== '')

  return { newDigits, nextFocusIndex, isComplete }
}

/**
 * Calculates backward focus movement on Backspace.
 */
export function getPreviousFocusIndex(
  currentIndex: number,
  currentDigit: string,
  key: string
): number | null {
  if (key === 'Backspace' && !currentDigit && currentIndex > 0) {
    return currentIndex - 1
  }
  return null
}
