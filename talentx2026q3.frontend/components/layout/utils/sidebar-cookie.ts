import { cookies } from "next/headers";
import { PORTAL_SIDEBAR_COLLAPSED_COOKIE } from "../constants/sidebar.constants";

export async function getSidebarCollapsedCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(PORTAL_SIDEBAR_COLLAPSED_COOKIE)?.value === "true";
  } catch {
    return false;
  }
}
