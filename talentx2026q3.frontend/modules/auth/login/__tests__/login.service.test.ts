import { redirect } from "next/navigation";
import { login } from "../services/login.service";
import { setAuthCookies } from "../../shared/auth-cookies.service";
import { decodeAccessToken } from "@/lib/auth/jwt";
import { UserRole } from "@/types/auth";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("../../shared/auth-cookies.service", () => ({
  setAuthCookies: jest.fn(),
}));

jest.mock("@/lib/auth/jwt", () => ({
  decodeAccessToken: jest.fn(),
}));

const mockRedirect = redirect as unknown as jest.Mock;
const mockSetAuthCookies = setAuthCookies as unknown as jest.Mock;
const mockDecodeAccessToken = decodeAccessToken as unknown as jest.Mock;

describe("login service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("redirects Admin role to /admin/dashboard on successful login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        userId: "admin-1",
        email: "superadmin@ait.com",
        accessToken: "admin-access-token",
        refreshToken: "admin-refresh-token",
      }),
    } as Response);

    mockDecodeAccessToken.mockReturnValue({
      userId: "admin-1",
      email: "superadmin@ait.com",
      role: UserRole.Admin,
    });

    await login({
      email: "superadmin@ait.com",
      password: "SuperSecretPassword123!",
    });

    expect(mockSetAuthCookies).toHaveBeenCalledWith({
      accessToken: "admin-access-token",
      refreshToken: "admin-refresh-token",
    });
    expect(mockRedirect).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("redirects Employer role to /dashboard on successful login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        userId: "emp-1",
        email: "employer@ait.com",
        accessToken: "emp-access-token",
        refreshToken: "emp-refresh-token",
      }),
    } as Response);

    mockDecodeAccessToken.mockReturnValue({
      userId: "emp-1",
      email: "employer@ait.com",
      role: UserRole.Employer,
    });

    await login({
      email: "employer@ait.com",
      password: "EmployerPassword123!",
    });

    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects Talent role to /dashboard on successful login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        userId: "talent-1",
        email: "talent@ait.com",
        accessToken: "talent-access-token",
        refreshToken: "talent-refresh-token",
      }),
    } as Response);

    mockDecodeAccessToken.mockReturnValue({
      userId: "talent-1",
      email: "talent@ait.com",
      role: UserRole.Talent,
    });

    await login({
      email: "talent@ait.com",
      password: "TalentPassword123!",
    });

    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("surfaces the exact deactivation message when the backend returns it", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => [
        "Your account has been deactivated. Please contact TalentX support for more information.",
      ],
    } as Response);

    const result = await login({
      email: "jordan@talentx.com",
      password: "SomePassword123!",
    });

    expect(result).toEqual({
      success: false,
      error:
        "Your account has been deactivated. Please contact TalentX support for more information.",
    });
  });

  it("maps a backend lockout signal to the 15-minute locked message", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ["Account is locked out. Try again later."],
    } as Response);

    const result = await login({
      email: "jordan@talentx.com",
      password: "WrongPassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "Too many failed attempts. Your account is locked for 15 minutes",
    });
  });

  it("maps a lockout variant to the 15-minute locked message", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ["Account Lockout: exceeded max failed access attempts."],
    } as Response);

    const result = await login({
      email: "jordan@talentx.com",
      password: "WrongPassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "Too many failed attempts. Your account is locked for 15 minutes",
    });
  });

  it("still falls back to the generic message for a plain wrong-password array body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ["Invalid credentials."],
    } as Response);

    const result = await login({
      email: "jordan@talentx.com",
      password: "WrongPassword123!",
    });

    expect(result).toEqual({
      success: false,
      error: "Invalid email or password.",
    });
  });
});
