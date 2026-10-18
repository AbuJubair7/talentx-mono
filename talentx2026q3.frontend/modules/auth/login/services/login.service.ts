"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/config";
import { loginSchema, type LoginInput, type LoginState } from "../types";
import { setAuthCookies } from "../../shared/auth-cookies.service";
import { decodeAccessToken } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

const ACCOUNT_LOCKED_MESSAGE = "Too many failed attempts. Your account is locked for 15 minutes";

function isAccountLockedMessage(entry: string): boolean {
  const normalized = entry.toLowerCase();
  return normalized.includes("locked out") || normalized.includes("lockout");
}

type LoginApiResponse = {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
};

const roleHome: Record<UserRole, string> = {
  [UserRole.Employer]: "/dashboard",
  [UserRole.Talent]: "/dashboard",
  [UserRole.Guest]: "/change-password?source=verification",
  [UserRole.Admin]: "/admin/dashboard",
};

export async function login(input: LoginInput, redirectTo?: string): Promise<LoginState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid email or password." };
  }

  const loginResponse = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store",
  });

  if (!loginResponse.ok) {
    const errorBody = await loginResponse.json().catch(() => null);

    // Narrow, additive check: AuthController.Login's failure body is a raw string[], which the
    // general fallback below can't read (it only checks errorBody?.message). Deactivation is
    // surfaced verbatim; a backend lockout signal is mapped to the friendly 15-minute message.
    const deactivatedMessage = Array.isArray(errorBody)
      ? errorBody.find(
          (entry): entry is string => typeof entry === "string" && entry.includes("deactivated")
        )
      : undefined;

    const isAccountLocked = Array.isArray(errorBody)
      ? errorBody.some(
          (entry): entry is string => typeof entry === "string" && isAccountLockedMessage(entry)
        )
      : false;

    if (isAccountLocked) {
      return { success: false, error: ACCOUNT_LOCKED_MESSAGE };
    }

    return {
      success: false,
      error: deactivatedMessage ?? errorBody?.message ?? errorBody?.title ?? "Invalid email or password.",
    };
  }

  const loginResponseData: LoginApiResponse = await loginResponse.json();
  await setAuthCookies({ accessToken: loginResponseData.accessToken, refreshToken: loginResponseData.refreshToken });

  const session = decodeAccessToken(loginResponseData.accessToken);
  let targetRedirectPath = session?.role ? roleHome[session.role] : "/";

  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    targetRedirectPath = redirectTo;
  }

  redirect(targetRedirectPath);
}