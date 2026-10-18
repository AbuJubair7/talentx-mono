import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { decodeAccessToken } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";
import { SessionRefreshView } from "@/modules/auth/refresh";

export const metadata: Metadata = {
  title: "Restoring session — TalentX",
  description: "Restoring your TalentX session.",
};

function roleHome(role: UserRole): string {
  switch (role) {
    case UserRole.Admin:
      return "/admin/dashboard";
    case UserRole.Guest:
      return "/change-password";
    case UserRole.Employer:
    case UserRole.Talent:
    default:
      return "/dashboard";
  }
}

interface SessionRefreshPageProps {
  searchParams: Promise<{ target?: string }>;
}

export default async function SessionRefreshPage({ searchParams }: SessionRefreshPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawTarget = resolvedSearchParams?.target;
  const isSafeTarget =
    Boolean(rawTarget) &&
    rawTarget!.startsWith("/") &&
    !rawTarget!.startsWith("//");

  const { accessToken, refreshToken } = await getAuthCookies();

  // Still valid (e.g. direct visit): skip the refresh round-trip.
  const session = accessToken ? decodeAccessToken(accessToken) : null;
  if (session) {
    redirect(isSafeTarget ? rawTarget! : roleHome(session.role));
  }

  if (!refreshToken) {
    redirect("/login");
  }

  // Access cookie gone but refresh cookie present: the access token can't be
  // decoded, so best-effort decode the refresh token for a routing hint only
  // (never for authorization). Falls back to /dashboard.
  const hint = decodeAccessToken(refreshToken);
  const fallbackTarget = hint ? roleHome(hint.role) : "/dashboard";
  const target = isSafeTarget ? rawTarget : fallbackTarget;

  return <SessionRefreshView target={target} />;
}
