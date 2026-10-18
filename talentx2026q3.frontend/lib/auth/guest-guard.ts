import { decodeAccessToken } from "@/lib/auth/decode-access-token";
import { UserRole } from "@/types/auth";

// Paths a Guest-role session may still access. Everything else bounces the
// user back to the mandatory set-password flow (Guest → Talent graduation).
const GUEST_ALLOWED_PREFIXES = [
  "/change-password",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api",
] as const;

export const CHANGE_PASSWORD_PATH = "/change-password";
export const CHANGE_PASSWORD_URL = "/change-password?source=verification";

function isGuestAllowedPath(pathname: string): boolean {
  return GUEST_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Pure decision for the guest lock-in guard: returns the redirect path
 * (with `source=verification`) when a Guest session must be bounced, or
 * `null` when the request may proceed unchanged.
 */
export function resolveGuestRedirect(
  pathname: string,
  search: string,
  token: string | undefined
): string | null {
  if (!token) {
    return null;
  }

  const session = decodeAccessToken(token);
  if (!session || session.role !== UserRole.Guest) {
    return null;
  }

  if (!isGuestAllowedPath(pathname)) {
    return CHANGE_PASSWORD_URL;
  }

  // Always show the temp-password banner for guests, even on direct hits.
  if (pathname === CHANGE_PASSWORD_PATH && !new URLSearchParams(search).has("source")) {
    return CHANGE_PASSWORD_URL;
  }

  return null;
}
