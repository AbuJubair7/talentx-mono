import {
  PORTAL_SIDEBAR_COLLAPSED_COOKIE,
  SIDEBAR_COOKIE_MAX_AGE_SECONDS,
} from "../constants/sidebar.constants";

export function setSidebarCollapsedCookie(isCollapsed: boolean): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${PORTAL_SIDEBAR_COLLAPSED_COOKIE}=${isCollapsed}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
