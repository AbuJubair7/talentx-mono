import React from "react";
import { render, screen } from "@testing-library/react";

import VerifyEmailPage from "@/app/(public)/verify-application/page";
import { useVerifyEmail } from "@/modules/verify-email/hooks/use-verify-email";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/verify-application",
  useSearchParams: () => new URLSearchParams("token=test-token"),
}));

jest.mock("@/modules/verify-email/hooks/use-verify-email", () => ({
  useVerifyEmail: jest.fn(),
}));

const mockedUseVerifyEmail = useVerifyEmail as jest.MockedFunction<typeof useVerifyEmail>;

describe("VerifyEmailPage", () => {
  it("shows the temporary-password message and Set New Password CTA when a password change is required", () => {
    mockedUseVerifyEmail.mockReturnValue({
      status: "success",
      message: "",
      userEmail: "candidate@example.com",
      requiresPasswordChange: true,
      countdown: 4,
    });

    render(<VerifyEmailPage />);

    expect(screen.getByText("Email verified!")).toBeInTheDocument();
    expect(screen.getByText("Check your email")).toBeInTheDocument();
    expect(
      screen.getByText(/A temporary password has been sent to/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("candidate@example.com").length
    ).toBeGreaterThanOrEqual(1);

    const cta = screen.getByRole("link", { name: "Set New Password" });
    expect(cta).toHaveAttribute("href", "/change-password?source=verification");

    expect(screen.getByText(/Redirecting you to set your password in 4s/i)).toBeInTheDocument();
  });

  it("shows the dashboard CTA when no password change is required", () => {
    mockedUseVerifyEmail.mockReturnValue({
      status: "success",
      message: "",
      userEmail: "candidate@example.com",
      requiresPasswordChange: false,
      countdown: 3,
    });

    render(<VerifyEmailPage />);

    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();

    const cta = screen.getByRole("link", { name: "Go to Dashboard" });
    expect(cta).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText(/Redirecting you to your dashboard in 3s/i)).toBeInTheDocument();
  });

  it("shows the failure card with the server message", () => {
    mockedUseVerifyEmail.mockReturnValue({
      status: "error",
      message: "The link may have expired.",
      userEmail: "",
      requiresPasswordChange: true,
      countdown: 5,
    });

    render(<VerifyEmailPage />);

    expect(screen.getByText("Verification failed")).toBeInTheDocument();
    expect(screen.getByText("The link may have expired.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Set New Password" })).not.toBeInTheDocument();
  });

  it("shows the loading state while verifying", () => {
    mockedUseVerifyEmail.mockReturnValue({
      status: "loading",
      message: "",
      userEmail: "",
      requiresPasswordChange: true,
      countdown: 5,
    });

    render(<VerifyEmailPage />);

    expect(screen.getByText("Checking verification…")).toBeInTheDocument();
  });
});
