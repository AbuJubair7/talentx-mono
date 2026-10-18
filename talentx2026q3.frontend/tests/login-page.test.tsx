import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/app/(public)/(auth)/login/page";
import { useLoginForm } from "@/modules/auth/login/hooks/use-login-form";
import { getAuthCookies } from "@/modules/auth/shared/auth-cookies.service";
import { decodeAccessToken, type SessionPayload } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/auth";

jest.mock("@/modules/auth/login/hooks/use-login-form", () => ({
  useLoginForm: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/modules/auth/shared/auth-cookies.service", () => ({
  getAuthCookies: jest.fn(),
}));

jest.mock("@/lib/auth/jwt", () => ({
  decodeAccessToken: jest.fn(),
}));

const mockedUseLoginForm = useLoginForm as jest.MockedFunction<typeof useLoginForm>;
const mockedGetAuthCookies = getAuthCookies as jest.MockedFunction<typeof getAuthCookies>;
const mockedDecodeAccessToken = decodeAccessToken as jest.MockedFunction<typeof decodeAccessToken>;
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;

function renderWithProviders(uiElement: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{uiElement}</QueryClientProvider>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: null, refreshToken: null });
    mockedDecodeAccessToken.mockReturnValue(null);
    mockedUseLoginForm.mockReturnValue({
      form: {
        register: jest.fn(),
        handleSubmit: () => (event?: React.BaseSyntheticEvent) => event?.preventDefault?.(),
        formState: { errors: {} },
      } as unknown as ReturnType<typeof useLoginForm>["form"],
      onSubmit: jest.fn(),
      serverError: null,
      isSubmitting: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("shows the deactivation banner when ?reason=account-deactivated is present", async () => {
    const pageElement = await LoginPage({
      searchParams: Promise.resolve({ reason: "account-deactivated" }),
    });
    renderWithProviders(pageElement);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your account has been deactivated. Please contact TalentX support for more information."
    );
  });

  it("does not show the deactivation banner when the reason param is absent", async () => {
    const pageElement = await LoginPage({ searchParams: Promise.resolve({}) });
    renderWithProviders(pageElement);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not show the deactivation banner for an unrelated reason value", async () => {
    const pageElement = await LoginPage({
      searchParams: Promise.resolve({ reason: "something-else" }),
    });
    renderWithProviders(pageElement);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("redirects an already logged-in Employer to /dashboard", async () => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: "valid-token", refreshToken: "refresh-token" });
    mockedDecodeAccessToken.mockReturnValue({ sub: "user-1", role: UserRole.Employer } as SessionPayload);

    await LoginPage({ searchParams: Promise.resolve({}) });

    expect(mockedRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects an already logged-in Admin to /admin/dashboard", async () => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: "valid-token", refreshToken: "refresh-token" });
    mockedDecodeAccessToken.mockReturnValue({ sub: "user-1", role: UserRole.Admin } as SessionPayload);

    await LoginPage({ searchParams: Promise.resolve({}) });

    expect(mockedRedirect).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("renders the login form when only a refresh token exists (no inline refresh)", async () => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: null, refreshToken: "refresh-token" });
    mockedDecodeAccessToken.mockReturnValue(null);

    const pageElement = await LoginPage({ searchParams: Promise.resolve({}) });
    renderWithProviders(pageElement);

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders the login form when no session exists", async () => {
    mockedGetAuthCookies.mockResolvedValue({ accessToken: null, refreshToken: null });

    const pageElement = await LoginPage({ searchParams: Promise.resolve({}) });
    renderWithProviders(pageElement);

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });
});
