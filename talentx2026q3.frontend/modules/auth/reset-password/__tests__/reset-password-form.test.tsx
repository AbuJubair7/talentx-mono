import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { ResetPasswordForm } from "../components/reset-password-form";
import { resetPassword } from "../services/reset-password.service";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../services/reset-password.service", () => ({
  resetPassword: jest.fn(),
}));

const mockedResetPassword = jest.mocked(resetPassword);

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

describe("ResetPasswordForm", () => {
  const defaultProps = {
    email: "test@example.com",
    token: "valid-test-token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the reset password form with password inputs and submit button", () => {
    renderWithProviders(<ResetPasswordForm {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Set new password" })).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset Password" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to log in/i })).toHaveAttribute("href", "/login");
  });

  it("toggles password visibility when clicking show/hide buttons", () => {
    renderWithProviders(<ResetPasswordForm {...defaultProps} />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    const toggleButtons = screen.getAllByRole("button", { name: "Show password" });
    fireEvent.click(toggleButtons[0]);
    fireEvent.click(toggleButtons[1]);

    expect(newPasswordInput).toHaveAttribute("type", "text");
    expect(confirmPasswordInput).toHaveAttribute("type", "text");

    const hideButtons = screen.getAllByRole("button", { name: "Hide password" });
    fireEvent.click(hideButtons[0]);
    fireEvent.click(hideButtons[1]);

    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  it("shows validation error on empty password submission", async () => {
    renderWithProviders(<ResetPasswordForm {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
      expect(screen.getByText("Please confirm your password")).toBeInTheDocument();
    });

    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when password does not meet complexity requirements", async () => {
    renderWithProviders(<ResetPasswordForm {...defaultProps} />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    fireEvent.change(newPasswordInput, { target: { value: "lowercaseonly123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "lowercaseonly123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password must include an uppercase letter, a lowercase letter, a number, and a special character"
        )
      ).toBeInTheDocument();
    });

    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    renderWithProviders(<ResetPasswordForm {...defaultProps} />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    fireEvent.change(newPasswordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "DifferentPass123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it("displays expired token error alert and request new link button when token is invalid or expired", async () => {
    mockedResetPassword.mockResolvedValueOnce({
      success: false,
      error: "Invalid or expired password reset token.",
    });

    renderWithProviders(<ResetPasswordForm {...defaultProps} />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    fireEvent.change(newPasswordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "StrongPass123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("This password reset link has expired or has already been used.")
      ).toBeInTheDocument();
      const requestNewLinkButton = screen.getByRole("link", { name: "Request a new link" });
      expect(requestNewLinkButton).toBeInTheDocument();
      expect(requestNewLinkButton).toHaveAttribute("href", "/forgot-password");
    });
  });

  it("submits valid passwords and navigates to login with toast on success", async () => {
    mockedResetPassword.mockResolvedValueOnce({ success: true });
    const onSuccessCallback = jest.fn();

    renderWithProviders(
      <ResetPasswordForm {...defaultProps} onSuccess={onSuccessCallback} />
    );

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });

    fireEvent.change(newPasswordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "StrongPass123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedResetPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        token: "valid-test-token",
        newPassword: "StrongPass123!",
        confirmPassword: "StrongPass123!",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Password reset successfully. Please log in with your new credentials."
      );
      expect(onSuccessCallback).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});
