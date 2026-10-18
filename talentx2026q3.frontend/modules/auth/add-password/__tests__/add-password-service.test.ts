import { cookies } from "next/headers";
import { serverApiClient } from "@/lib/api/server-axios";
import { REFRESH_TOKEN_COOKIE } from "@/modules/auth/shared/cookie-config";
import { addPassword } from "../services/add-password.service";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/lib/api/server-axios", () => ({
  serverApiClient: {
    post: jest.fn(),
  },
}));

const mockedCookies = jest.mocked(cookies);
const mockedServerApiClient = jest.mocked(serverApiClient);

describe("addPassword service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reads current refresh token from cookies and forwards it to serverApiClient", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "active-refresh-token-value" }),
    };
    mockedCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedServerApiClient.post.mockResolvedValueOnce({ data: {} });

    const result = await addPassword({
      newPassword: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(mockCookieStore.get).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE);
    expect(mockedServerApiClient.post).toHaveBeenCalledWith("/auth/add-password", {
      newPassword: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
      currentRefreshToken: "active-refresh-token-value",
    });
    expect(result).toEqual({ success: true });
  });

  it("handles missing refresh token cookie gracefully", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue(undefined),
    };
    mockedCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedServerApiClient.post.mockResolvedValueOnce({ data: {} });

    const result = await addPassword({
      newPassword: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(mockedServerApiClient.post).toHaveBeenCalledWith("/auth/add-password", {
      newPassword: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
      currentRefreshToken: undefined,
    });
    expect(result).toEqual({ success: true });
  });

  it("returns validation error when password does not meet requirements", async () => {
    const result = await addPassword({
      newPassword: "short",
      confirmPassword: "short",
    });

    expect(result).toEqual({
      success: false,
      error: "Please check the form and try again.",
    });
    expect(mockedServerApiClient.post).not.toHaveBeenCalled();
  });

  it("returns network error message when server is unreachable", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "active-token" }),
    };
    mockedCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedServerApiClient.post.mockRejectedValueOnce({
      status: null,
      message: "Network Error",
    });

    const result = await addPassword({
      newPassword: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "Unable to reach the server. Please try again.",
    });
  });

  it("returns api error message when backend returns an error", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "active-token" }),
    };
    mockedCookies.mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>);
    mockedServerApiClient.post.mockRejectedValueOnce({
      status: 400,
      message: "User already has a password set.",
    });

    const result = await addPassword({
      newPassword: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "User already has a password set.",
    });
  });
});
