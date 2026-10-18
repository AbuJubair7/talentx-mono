"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { mapSessionToHeaderUser, type HeaderUser } from "./types";
import { UserRole } from "@/types/auth";

export const headerSessionKeys = {
  all: ["auth"] as const,
  session: () => [...headerSessionKeys.all, "session"] as const,
} as const;

export interface UseHeaderSessionOptions {
  initialUser?: HeaderUser | null;
  enabled?: boolean;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length < 2) {
      return null;
    }
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((character) => "%" + ("00" + character.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsedPayload = JSON.parse(jsonPayload);
    if (
      parsedPayload &&
      typeof parsedPayload.exp === "number" &&
      parsedPayload.exp * 1000 < Date.now()
    ) {
      return null;
    }
    return parsedPayload;
  } catch {
    return null;
  }
}

export async function fetchHeaderSession(): Promise<HeaderUser | null> {
  try {
    const { accessToken } = await getAuthCookies();
    if (!accessToken) {
      return null;
    }
    const payload = parseJwtPayload(accessToken);
    return mapSessionToHeaderUser(payload);
  } catch {
    return null;
  }
}

export function useHeaderSession({
  initialUser = null,
  enabled = true,
}: UseHeaderSessionOptions = {}) {
  const sessionQuery = useQuery({
    queryKey: headerSessionKeys.session(),
    queryFn: fetchHeaderSession,
    initialData: initialUser !== undefined && initialUser !== null ? initialUser : undefined,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
    retry: false,
    enabled,
  });

  const user = sessionQuery.data ?? null;
  const normalizedRole = user?.role?.trim().toLowerCase();
  const isTalent = Boolean(user && (normalizedRole === "talent" || user.role === UserRole.Talent));
  const isEmployer = Boolean(user && (normalizedRole === "employer" || user.role === UserRole.Employer));
  const isAdmin = Boolean(user && (normalizedRole === "admin" || user.role === UserRole.Admin));
  const isAuthenticated = Boolean(user && user.role);

  return {
    ...sessionQuery,
    user,
    isAuthenticated,
    isTalent,
    isEmployer,
    isAdmin,
  };
}
