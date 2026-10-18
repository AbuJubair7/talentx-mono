export const DELETE_ACCOUNT_COOLDOWN_KEY = "talentx:delete_account_cooldown_until";
export const RESEND_COOLDOWN_SECONDS = 60;

export function getStoredCooldownSeconds(): number {
  if (typeof window === "undefined" || !window.sessionStorage) return 0;
  try {
    const stored = window.sessionStorage.getItem(DELETE_ACCOUNT_COOLDOWN_KEY);
    if (!stored) return 0;
    const expiresAt = parseInt(stored, 10);
    if (isNaN(expiresAt)) return 0;
    const diffMs = expiresAt - Date.now();
    return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
  } catch {
    return 0;
  }
}

export function setStoredCooldownSeconds(seconds: number = RESEND_COOLDOWN_SECONDS): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    const expiresAt = Date.now() + seconds * 1000;
    window.sessionStorage.setItem(DELETE_ACCOUNT_COOLDOWN_KEY, expiresAt.toString());
  } catch {
    // Ignore storage write errors (e.g. private mode quota)
  }
}

export function clearStoredCooldown(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(DELETE_ACCOUNT_COOLDOWN_KEY);
  } catch {
    // Ignore storage errors
  }
}
