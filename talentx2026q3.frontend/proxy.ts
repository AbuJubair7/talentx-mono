import { NextRequest, NextResponse } from "next/server";

import { resolveGuestRedirect } from "@/lib/auth/guest-guard";
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/shared/cookie-config";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { pathname, search } = request.nextUrl;

  const redirectPath = resolveGuestRedirect(pathname, search, token);
  if (redirectPath) {
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
