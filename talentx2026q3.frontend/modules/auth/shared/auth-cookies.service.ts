"use server";

import { cookies } from "next/headers";
import { 
  ACCESS_TOKEN_COOKIE, 
  accessTokenCookieOptions, 
  REFRESH_TOKEN_COOKIE, 
  refreshTokenCookieOptions 
} from "./cookie-config";

export async function setAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, accessTokenCookieOptions);
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshTokenCookieOptions);
}

export async function getAuthCookies() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
  };
}

export async function deleteAuthCookies() {
  const cookieStore = await cookies();

  // Passing path and domain matching ensures reliable deletion across all browser engines
  cookieStore.delete({
    name: ACCESS_TOKEN_COOKIE,
    path: accessTokenCookieOptions.path ?? "/",
    domain: accessTokenCookieOptions.domain,
  });
  cookieStore.delete({
    name: REFRESH_TOKEN_COOKIE,
    path: refreshTokenCookieOptions.path ?? "/",
    domain: refreshTokenCookieOptions.domain,
  });
}