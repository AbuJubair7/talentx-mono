import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { SessionPayload, decodeAccessToken } from "@/lib/auth/jwt";

export async function getSession(): Promise<SessionPayload | null> {
  const { accessToken } = await getAuthCookies();
  return accessToken ? decodeAccessToken(accessToken) : null;
}