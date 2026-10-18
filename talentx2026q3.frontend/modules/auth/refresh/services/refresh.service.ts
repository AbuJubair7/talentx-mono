"use server";

import { cookies } from "next/headers";
import {
  REFRESH_TOKEN_COOKIE,
} from "../../shared/cookie-config";
import { API_URL } from "@/lib/config";
import { deleteAuthCookies, setAuthCookies } from "../../shared/auth-cookies.service";

type RefreshApiResponse = {
  accessToken: string;
  refreshToken: string;
};

function isValidRefreshResponse(data: unknown): data is RefreshApiResponse {
  return (
    !!data &&
    typeof (data as RefreshApiResponse).accessToken === "string" &&
    typeof (data as RefreshApiResponse).refreshToken === "string"
  );
}

export async function refreshSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return false;
  }

  const data = await fetchNewTokens(refreshToken);

  if (!data) {
    await deleteAuthCookies();
    return false;
  }
  await setAuthCookies({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return true;
}

async function fetchNewTokens(refreshToken: string): Promise<RefreshApiResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const json = await response.json();
    return isValidRefreshResponse(json) ? json : null;
  } catch {
    return null;
  }
}