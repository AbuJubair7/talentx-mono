import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ResetPasswordPage from "@/app/(public)/(auth)/reset-password/page";
import { validateResetToken } from "@/modules/auth/reset-password/services/reset-password.service";

jest.mock("@/modules/auth/reset-password/services/reset-password.service", () => ({
  validateResetToken: jest.fn(),
}));

const mockedValidateResetToken = jest.mocked(validateResetToken);

function renderWithProviders(uiElement: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {uiElement}
    </QueryClientProvider>
  );
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders error card when token is missing", async () => {
    const pageElement = await ResetPasswordPage({
      searchParams: Promise.resolve({ email: "user@example.com" }),
    });
    renderWithProviders(pageElement);

    expect(
      screen.getByText("Invalid or missing password reset link.")
    ).toBeInTheDocument();
    const requestNewLinkButton = screen.getByRole("link", {
      name: "Request a new link",
    });
    expect(requestNewLinkButton).toBeInTheDocument();
    expect(requestNewLinkButton).toHaveAttribute("href", "/forgot-password");
  });

  it("renders error card when email is missing", async () => {
    const pageElement = await ResetPasswordPage({
      searchParams: Promise.resolve({ token: "sample-token-123" }),
    });
    renderWithProviders(pageElement);

    expect(
      screen.getByText("Invalid or missing password reset link.")
    ).toBeInTheDocument();
    const requestNewLinkButton = screen.getByRole("link", {
      name: "Request a new link",
    });
    expect(requestNewLinkButton).toBeInTheDocument();
    expect(requestNewLinkButton).toHaveAttribute("href", "/forgot-password");
  });

  it("renders error card when both token and email are missing", async () => {
    const pageElement = await ResetPasswordPage({
      searchParams: Promise.resolve({}),
    });
    renderWithProviders(pageElement);

    expect(
      screen.getByText("Invalid or missing password reset link.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Request a new link" })
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("renders expired or already used card when token pre-validation fails", async () => {
    mockedValidateResetToken.mockResolvedValue(false);

    const pageElement = await ResetPasswordPage({
      searchParams: Promise.resolve({
        token: "already-used-or-expired-token",
        email: "user@example.com",
      }),
    });
    renderWithProviders(pageElement);

    expect(
      screen.getByRole("heading", {
        name: "Password reset link expired or already used",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This password reset link has already been used or has expired. Please request a new link to reset your password."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Request a new link" })
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("renders brand panel and reset password form when token is valid", async () => {
    mockedValidateResetToken.mockResolvedValue(true);

    const pageElement = await ResetPasswordPage({
      searchParams: Promise.resolve({
        token: "sample-token-123",
        email: "user@example.com",
      }),
    });
    renderWithProviders(pageElement);

    expect(
      screen.getByRole("heading", { name: "Set new password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset Password" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Reduce hiring effort/i)).toBeInTheDocument();
  });
});
