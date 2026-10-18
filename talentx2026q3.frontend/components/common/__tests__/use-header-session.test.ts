import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import {
  useHeaderSession,
  fetchHeaderSession,
  headerSessionKeys,
} from "../use-header-session";
import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { UserRole } from "@/types/auth";

jest.mock("@/modules/auth/shared/auth-cookies.service", () => ({
  getAuthCookies: jest.fn(),
}));

const mockedGetAuthCookies = getAuthCookies as jest.MockedFunction<
  typeof getAuthCookies
>;

function createTestQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const TestQueryWrapper = ({ children }: { children: ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  return { queryClient, wrapper: TestQueryWrapper };
}

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const stringifiedPayload = btoa(JSON.stringify(payload));
  const signature = "mock-signature";
  return `${header}.${stringifiedPayload}.${signature}`;
}

describe("useHeaderSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exports hierarchical headerSessionKeys", () => {
    expect(headerSessionKeys.all).toEqual(["auth"]);
    expect(headerSessionKeys.session()).toEqual(["auth", "session"]);
  });

  describe("fetchHeaderSession", () => {
    it("returns null when no accessToken is present in cookies", async () => {
      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: null,
        refreshToken: null,
      });

      const session = await fetchHeaderSession();
      expect(session).toBeNull();
    });

    it("returns parsed and mapped HeaderUser when valid accessToken is present", async () => {
      const mockToken = createMockJwt({
        sub: "user-123",
        role: UserRole.Employer,
        email: "employer@acme.com",
        name: "Acme Corp",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: mockToken,
        refreshToken: null,
      });

      const session = await fetchHeaderSession();
      expect(session).toEqual({
        name: "Acme Corp",
        email: "employer@acme.com",
        role: UserRole.Employer,
        avatarUrl: null,
      });
    });

    it("returns null when accessToken is expired", async () => {
      const expiredToken = createMockJwt({
        sub: "user-123",
        role: UserRole.Talent,
        email: "expired@example.com",
        exp: Math.floor(Date.now() / 1000) - 60,
      });

      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: expiredToken,
        refreshToken: null,
      });

      const session = await fetchHeaderSession();
      expect(session).toBeNull();
    });

    it("returns null when token parsing throws an error", async () => {
      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: "invalid-malformed-token",
        refreshToken: null,
      });

      const session = await fetchHeaderSession();
      expect(session).toBeNull();
    });
  });

  describe("useHeaderSession hook", () => {
    it("initializes with initialUser when provided", () => {
      const { wrapper } = createTestQueryWrapper();
      const initialUser = {
        name: "Initial Employer",
        email: "employer@test.com",
        role: "Employer",
        avatarUrl: null,
      };

      const { result } = renderHook(
        () => useHeaderSession({ initialUser }),
        { wrapper }
      );

      expect(result.current.user).toEqual(initialUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isEmployer).toBe(true);
      expect(result.current.isTalent).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });

    it("fetches and resolves user autonomously on mount", async () => {
      const mockToken = createMockJwt({
        sub: "talent-999",
        role: "Talent",
        email: "talent@authed.com",
        name: "Jane Talent",
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      mockedGetAuthCookies.mockResolvedValueOnce({
        accessToken: mockToken,
        refreshToken: null,
      });

      const { wrapper } = createTestQueryWrapper();
      const { result } = renderHook(() => useHeaderSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual({
          name: "Jane Talent",
          email: "talent@authed.com",
          role: "Talent",
          avatarUrl: null,
        });
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isTalent).toBe(true);
      expect(result.current.isEmployer).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });

    it("resolves isAdmin correctly when user role is Admin", () => {
      const { wrapper } = createTestQueryWrapper();
      const initialUser = {
        name: "Admin User",
        email: "admin@test.com",
        role: "Admin",
        avatarUrl: null,
      };

      const { result } = renderHook(
        () => useHeaderSession({ initialUser }),
        { wrapper }
      );

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isEmployer).toBe(false);
      expect(result.current.isTalent).toBe(false);
    });
  });
});
