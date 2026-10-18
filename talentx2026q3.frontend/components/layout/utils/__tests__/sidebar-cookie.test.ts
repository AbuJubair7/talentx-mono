import vm from "node:vm";
import { cookies } from "next/headers";
import {
  PORTAL_SIDEBAR_COLLAPSED_COOKIE,
  SIDEBAR_COOKIE_MAX_AGE_SECONDS,
} from "../../constants/sidebar.constants";
import { getSidebarCollapsedCookie } from "../sidebar-cookie";
import { setSidebarCollapsedCookie } from "../sidebar-cookie-client";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe("sidebar-cookie utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSidebarCollapsedCookie", () => {
    it("returns true when cookie value is 'true'", async () => {
      mockCookies.mockResolvedValueOnce({
        get: jest.fn().mockReturnValue({ value: "true" }),
      } as unknown as Awaited<ReturnType<typeof cookies>>);

      const isCollapsed = await getSidebarCollapsedCookie();

      expect(isCollapsed).toBe(true);
      expect(mockCookies).toHaveBeenCalledTimes(1);
    });

    it("returns false when cookie value is 'false'", async () => {
      mockCookies.mockResolvedValueOnce({
        get: jest.fn().mockReturnValue({ value: "false" }),
      } as unknown as Awaited<ReturnType<typeof cookies>>);

      const isCollapsed = await getSidebarCollapsedCookie();

      expect(isCollapsed).toBe(false);
    });

    it("returns false when cookie value is undefined or cookie not found", async () => {
      mockCookies.mockResolvedValueOnce({
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as Awaited<ReturnType<typeof cookies>>);

      const isCollapsed = await getSidebarCollapsedCookie();

      expect(isCollapsed).toBe(false);
    });

    it("returns false when cookies() throws an error", async () => {
      mockCookies.mockRejectedValueOnce(
        new Error("Cookies context is unavailable")
      );

      const isCollapsed = await getSidebarCollapsedCookie();

      expect(isCollapsed).toBe(false);
    });
  });

  describe("setSidebarCollapsedCookie", () => {
    it("sets document.cookie with the correct name, value, path, max-age, and SameSite attribute", () => {
      const cookieSetterSpy = jest.spyOn(document, "cookie", "set");

      setSidebarCollapsedCookie(true);

      expect(cookieSetterSpy).toHaveBeenCalledWith(
        `${PORTAL_SIDEBAR_COLLAPSED_COOKIE}=true; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
      );

      setSidebarCollapsedCookie(false);

      expect(cookieSetterSpy).toHaveBeenCalledWith(
        `${PORTAL_SIDEBAR_COLLAPSED_COOKIE}=false; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
      );

      cookieSetterSpy.mockRestore();
    });

    it("safely returns without throwing when document is undefined", () => {
      // Escape backslashes so Windows paths survive embedding in the
      // vm script source as a JS string literal (no-op on POSIX).
      const clientPath = require
        .resolve("../sidebar-cookie-client")
        .replace(/\\/g, "\\\\");
      const script = new vm.Script(`
        if (typeof document !== "undefined") {
          throw new Error("document should be undefined in this context");
        }
        const { setSidebarCollapsedCookie } = require("${clientPath}");
        setSidebarCollapsedCookie(true);
        setSidebarCollapsedCookie(false);
      `);
      const context = vm.createContext({
        module,
        exports,
        require,
      });

      expect(() => script.runInContext(context)).not.toThrow();
    });
  });
});
