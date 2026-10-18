import { redirect } from "next/navigation";
import {
  deleteAccount,
  sendDeleteAccountOtp,
} from "../services/delete-account.service";
import { deleteAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import {
  serverApiClient,
  serverApiClientNoRefresh,
} from "@/lib/api/server-axios";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/modules/auth/shared/auth-cookies.service", () => ({
  deleteAuthCookies: jest.fn(),
}));

jest.mock("@/lib/api/server-axios", () => ({
  serverApiClient: { post: jest.fn() },
  serverApiClientNoRefresh: { post: jest.fn() },
}));

const mockRedirect = redirect as unknown as jest.Mock;
const mockDeleteAuthCookies = deleteAuthCookies as unknown as jest.Mock;
const mockPost = serverApiClient.post as unknown as jest.Mock;
const mockPostNoRefresh = serverApiClientNoRefresh.post as unknown as jest.Mock;

describe("delete-account service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends the OTP request through the standard authenticated client", async () => {
    mockPost.mockResolvedValue({ data: null });

    const result = await sendDeleteAccountOtp();

    expect(mockPost).toHaveBeenCalledWith("/auth/delete-account/send-otp");
    expect(result).toEqual({ success: true });
  });

  it("deletes via the no-refresh client, clears cookies and redirects", async () => {
    mockRedirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    mockPostNoRefresh.mockResolvedValue({ data: { email: "user@example.com" } });

    await expect(
      deleteAccount({ otp: "123456", isConfirmed: true })
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(mockPostNoRefresh).toHaveBeenCalledWith("/auth/delete-account", {
      otp: "123456",
    });
    expect(mockDeleteAuthCookies).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith("/goodbye");
  });

  it("does not clear cookies or redirect when the API rejects", async () => {
    mockPostNoRefresh.mockRejectedValue({
      status: 400,
      errors: ["Invalid or expired verification code."],
    });

    const result = await deleteAccount({ otp: "000000", isConfirmed: true });

    expect(result).toEqual({
      success: false,
      error: "Invalid or expired verification code.",
    });
    expect(mockDeleteAuthCookies).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("surfaces a rate-limit rejection message", async () => {
    mockPost.mockRejectedValue({
      status: 429,
      message: "Too many requests. Please try again later.",
    });

    const result = await sendDeleteAccountOtp();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Too many requests/i);
  });

  it("maps a network failure to a friendly message", async () => {
    mockPost.mockRejectedValue({ status: null, message: "boom" });

    const result = await sendDeleteAccountOtp();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unable to reach the server/);
  });
});
