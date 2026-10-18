import { NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/modules/auth/refresh/services/refresh.service";
import { APP_URL } from "@/lib/config";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

/**
 * Get the base URL from process.env, falling back to forwarded headers
 */
function getBaseUrl(req: NextRequest): string {
  // 1. Try env variable (Ensure protocol https:// is present)
  const envUrl = APP_URL;
  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }

  // 2. Fallback to AWS Amplify proxy headers
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost.split(",")[0].trim()}`;
  }

  // 3. Fallback for local development
  return req.nextUrl.origin;
}

function getRefererPath(req: NextRequest, baseUrl: string): string | null {
  const referer = req.headers.get("referer");
  if (!referer) return null;

  try {
    const refererUrl = new URL(referer);
    const targetBaseUrl = new URL(baseUrl);

    // Allow redirect only if referer host matches production host
    if (refererUrl.host !== targetBaseUrl.host) return null;

    return refererUrl.pathname + refererUrl.search;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);

  const explicitNext = req.nextUrl.searchParams.get("next");
  const fallbackNext = getRefererPath(req, baseUrl);

  const next = safeNextPath(explicitNext ?? fallbackNext);
  const ok = await refreshSession();

  const targetPath = ok ? next : "/login";

  // Explicitly redirect using the environment domain
  return NextResponse.redirect(new URL(targetPath, baseUrl));
}