import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddPasswordForm } from "../components/add-password-form";
import { addPassword } from "../services/add-password.service";

jest.mock("../services/add-password.service", () => ({
  addPassword: jest.fn(),
}));

const mockedAddPassword = jest.mocked(addPassword);

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

describe("AddPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the add password form with fields and submit button", () => {
    renderWithProviders(<AddPasswordForm />);

    expect(screen.getByRole("heading", { name: "Add a password" })).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Password" })).toBeInTheDocument();
  });

  it("toggles password visibility when clicking show and hide buttons", () => {
    renderWithProviders(<AddPasswordForm />);

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

  it("shows validation errors on empty submission", async () => {
    renderWithProviders(<AddPasswordForm />);

    const submitButton = screen.getByRole("button", { name: "Add Password" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("New password must be at least 8 characters")
      ).toBeInTheDocument();
      expect(screen.getByText("Please confirm your password")).toBeInTheDocument();
    });

    expect(mockedAddPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when password does not meet complexity requirements", async () => {
    renderWithProviders(<AddPasswordForm />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Add Password" });

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

    expect(mockedAddPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when passwords do not match", async () => {
    renderWithProviders(<AddPasswordForm />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Add Password" });

    fireEvent.change(newPasswordInput, { target: { value: "StrongPass123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "DifferentPass123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    expect(mockedAddPassword).not.toHaveBeenCalled();
  });

  it("submits valid passwords and invokes onSuccess callback upon success", async () => {
    mockedAddPassword.mockResolvedValueOnce({ success: true });
    const onSuccessCallback = jest.fn();

    renderWithProviders(<AddPasswordForm onSuccess={onSuccessCallback} />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Add Password" });

    fireEvent.change(newPasswordInput, { target: { value: "ValidPassword123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "ValidPassword123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAddPassword).toHaveBeenCalledTimes(1);
      expect(mockedAddPassword).toHaveBeenCalledWith({
        newPassword: "ValidPassword123!",
        confirmPassword: "ValidPassword123!",
      });
      expect(onSuccessCallback).toHaveBeenCalledTimes(1);
    });
  });

  it("displays server error message when submission fails", async () => {
    mockedAddPassword.mockResolvedValueOnce({
      success: false,
      error: "User already has a password set.",
    });

    renderWithProviders(<AddPasswordForm />);

    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Add Password" });

    fireEvent.change(newPasswordInput, { target: { value: "ValidPassword123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "ValidPassword123!" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("User already has a password set.");
    });
  });
});
