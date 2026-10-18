import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ForgotPasswordForm } from "../components/forgot-password-form";
import { forgotPassword } from "../services/forgot-password.service";

jest.mock("../services/forgot-password.service", () => ({
  forgotPassword: jest.fn(),
}));

const mockedForgotPassword = jest.mocked(forgotPassword);

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

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the forgot password form with fields and back to login link", () => {
    renderWithProviders(<ForgotPasswordForm />);

    expect(screen.getByRole("heading", { name: "Forgot password" })).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send reset instructions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to log in/i })).toHaveAttribute("href", "/login");
  });

  it("shows validation error when email is empty", async () => {
    renderWithProviders(<ForgotPasswordForm />);

    const submitButton = screen.getByRole("button", { name: "Send reset instructions" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    expect(mockedForgotPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when email format is invalid", async () => {
    renderWithProviders(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText("Work Email");
    const submitButton = screen.getByRole("button", { name: "Send reset instructions" });

    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });

    expect(mockedForgotPassword).not.toHaveBeenCalled();
  });

  it("displays prominent Google-only alert when account is registered with Google", async () => {
    mockedForgotPassword.mockResolvedValueOnce({
      success: false,
      provider: "Google",
      message: "This account is registered with Google. Please sign in with Google.",
    });

    renderWithProviders(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText("Work Email");
    const submitButton = screen.getByRole("button", { name: "Send reset instructions" });

    fireEvent.change(emailInput, { target: { value: "googleuser@company.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("This account is registered with Google. Please sign in with Google.")
      ).toBeInTheDocument();
      const googleLink = screen.getByRole("link", { name: "Sign in with Google" });
      expect(googleLink).toBeInTheDocument();
      expect(googleLink).toHaveAttribute("href", "/login");
    });
  });

  it("displays success confirmation and activates cooldown countdown when reset instructions are sent", async () => {
    mockedForgotPassword.mockResolvedValueOnce({
      success: true,
      provider: "Local",
      message: "If an account exists, instructions have been sent.",
    });

    renderWithProviders(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText("Work Email");
    const submitButton = screen.getByRole("button", { name: "Send reset instructions" });

    fireEvent.change(emailInput, { target: { value: "localuser@company.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "If an account exists for this email, we've sent instructions to reset your password. The link expires in 15 minutes."
        )
      ).toBeInTheDocument();
    });

    const cooldownButton = screen.getByRole("button", { name: "Resend instructions in 60s" });
    expect(cooldownButton).toBeInTheDocument();
    expect(cooldownButton).toBeDisabled();
  });

  it("decrements countdown timer and re-enables button when cooldown expires", async () => {
    jest.useFakeTimers();

    mockedForgotPassword.mockResolvedValueOnce({
      success: true,
      provider: "Local",
      message: "If an account exists, instructions have been sent.",
    });

    renderWithProviders(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText("Work Email");
    const submitButton = screen.getByRole("button", { name: "Send reset instructions" });

    fireEvent.change(emailInput, { target: { value: "localuser@company.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Resend instructions in 60s" })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Resend instructions in 60s" })).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByRole("button", { name: "Resend instructions in 59s" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend instructions in 59s" })).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(59000);
    });

    const reenabledButton = screen.getByRole("button", { name: "Send reset instructions" });
    expect(reenabledButton).toBeInTheDocument();
    expect(reenabledButton).not.toBeDisabled();

    jest.useRealTimers();
  });

  it("displays server error alert when server returns an unexpected error", async () => {
    mockedForgotPassword.mockResolvedValueOnce({
      success: false,
      error: "Unable to reach the server. Please try again.",
    });

    renderWithProviders(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText("Work Email");
    const submitButton = screen.getByRole("button", { name: "Send reset instructions" });

    fireEvent.change(emailInput, { target: { value: "user@company.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to reach the server. Please try again."
      );
    });
  });
});

