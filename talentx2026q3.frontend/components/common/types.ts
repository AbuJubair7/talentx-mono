import { UserRole } from "@/types/auth";

export interface HeaderUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
}

export interface HeaderProps {
  initialUser?: HeaderUser | null;
}

export function mapSessionToHeaderUser(
  session: Record<string, unknown> | null | undefined
): HeaderUser | null {
  if (!session) {
    return null;
  }

  const role =
    (session.role as string) ||
    (session["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string);

  if (!role || role === UserRole.Guest || role.toLowerCase() === "guest") {
    return null;
  }

  const email =
    (session.email as string) ||
    (session["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] as string) ||
    null;

  const rawName =
    (session.name as string) ||
    (session.unique_name as string) ||
    (session["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string);

  const isEmployer = role === UserRole.Employer || role.toLowerCase() === "employer";
  const defaultDisplayName = isEmployer ? "Employer User" : "Talent User";
  const name = rawName || defaultDisplayName;

  return {
    name,
    email,
    role,
    avatarUrl: null,
  };
}

