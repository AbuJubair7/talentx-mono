export const ACCESS_TOKEN_COOKIE = process.env.ACCESS_TOKEN_COOKIE ?? "TalentXAccessToken";
export const REFRESH_TOKEN_COOKIE = process.env.REFRESH_TOKEN_COOKIE ?? "TalentXRefreshToken";

function getAutoCookieDomain(): string | undefined {
  if (process.env.COOKIE_DOMAIN) {
    return process.env.COOKIE_DOMAIN;
  }

  try {
    const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || "";
    if (rawUrl) {
      const hostname = new URL(rawUrl).hostname;
      if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname.includes(".")) {
        const parts = hostname.split(".");
        if (parts.length >= 2) {
          return `.${parts.slice(-2).join(".")}`;
        }
      }
    }
  } catch {
    // fallback to host-only cookie
  }

  return undefined;
}

export const accessTokenCookieOptions = {
  httpOnly: true,
  // Amplify serves HTTPS in prod so Secure is required there, but Secure
  // cookies are dropped on http://localhost dev — gate on NODE_ENV.
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  domain: getAutoCookieDomain(),
  maxAge: 24 * 60 * 60,
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  domain: getAutoCookieDomain(),
  maxAge: 7 * 24 * 60 * 60, // 7 days
};