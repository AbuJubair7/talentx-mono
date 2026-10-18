import { decodeJwt } from "jose";

import { UserRole, VALID_USER_ROLES } from "@/types/auth";

export type Role = UserRole;

export type SessionPayload = {
  sub: string;
  role: UserRole;
  email?: string;
  name?: string;
  [key: string]: unknown;
};

function normalizeRole(raw: unknown): UserRole {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return VALID_USER_ROLES.includes(value as UserRole) ? (value as UserRole) : UserRole.Guest;
}

// WARNING: does not verify the signature or check expiry via crypto —
// treat this as a UI/routing hint only. Anyone can forge a cookie with
// an arbitrary role/sub, so never use this for anything that skips a
// real backend authorization check on the actual data request.
export function decodeAccessToken(token: string): SessionPayload | null {
  try {
    const payload = decodeJwt(token);

    // decodeJwt doesn't check exp — without this, requireAuth() will treat
    // an expired token as valid and your refresh flow will never trigger.
    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return null;
    }

    const rawRole =
      payload.role ??
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const rawName =
      (payload.name as string | undefined) ??
      (payload.unique_name as string | undefined) ??
      (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string | undefined);
    const rawEmail =
      (payload.email as string | undefined) ??
      (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string | undefined);

    return {
      ...payload,
      sub: payload.sub as string,
      role: normalizeRole(rawRole),
      name: rawName,
      email: rawEmail,
    };
  } catch {
    return null;
  }
}
