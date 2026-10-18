import { cache } from "react";
import { redirect } from "next/navigation";
import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { decodeAccessToken, SessionPayload } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

// Read-only: must never call refreshSession()/setAuthCookies() here — the
// RSC cookie store is read-only and cookie mutation throws
// ("Cookies can only be modified in a Server Action or Route Handler").
// Expired sessions with a refresh token go to the /session-refresh PAGE
// (a real page, not an API route, so SPA RSC navigation can render it),
// whose client component invokes refreshSession() as a true Server Action
// (writable cookies) and then routes to the role home. Amplify-safe: Node
// runtime only, no middleware/edge. Cached per-request so portal layout +
// page dedup to a single cookie read.
export const requireAuth = cache(async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<SessionPayload> {
  const { accessToken, refreshToken } = await getAuthCookies();
  const session = accessToken ? decodeAccessToken(accessToken) : null;

  if (!session) {
    redirect(refreshToken ? "/session-refresh" : "/login");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/not-authorized");
  }
  return session;
});