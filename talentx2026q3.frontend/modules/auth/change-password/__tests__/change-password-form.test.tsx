import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChangePasswordForm } from "../components/change-password-form";
import { changePassword } from "../services/change-password.service";
import { logout } from "../../logout/services/logout.service";

jest.mock("../services/change-password.service", () => ({
  changePassword: jest.fn(),
}));

jest.mock("../../logout/services/logout.service", () => ({
  logout: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedChangePassword = jest.mocked(changePassword);
const mockedLogout = jest.mocked(logout);
const mockedToastSuccess = jest.mocked(toast.success);

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

const validValues = {
  currentPassword: "OldPassword123!",
  newPassword: "NewPassword123!",
  confirmPassword: "NewPassword123!",
};

function fillForm() {
  fireEvent.change(screen.getByLabelText("Current Password"), {
    target: { value: validValues.currentPassword },
  });
  fireEvent.change(screen.getByLabelText("New Password"), {
    target: { value: validValues.newPassword },
  });
  fireEvent.change(screen.getByLabelText("Confirm New Password"), {
    target: { value: validValues.confirmPassword },
  });
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders password fields, requirements checklist, and submit button", () => {
    renderWithProviders(<ChangePasswordForm />);

    expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Password" })).toBeInTheDocument();
    expect(screen.getByText("Password Requirements")).toBeInTheDocument();
  });

  it("shows the verification instruction when coming from email verification", () => {
    renderWithProviders(<ChangePasswordForm showVerificationInstruction />);

    expect(screen.getByText("Check your email")).toBeInTheDocument();
  });

  it("toggles password visibility when clicking show/hide buttons", () => {
    renderWithProviders(<ChangePasswordForm />);

    const newPasswordInput = screen.getByLabelText("New Password");
    expect(newPasswordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getAllByRole("button", { name: "Show password" })[1]);
    expect(newPasswordInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(newPasswordInput).toHaveAttribute("type", "password");
  });

  it("shows validation errors when submitted empty", async () => {
    renderWithProviders(<ChangePasswordForm />);

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByText("Current password is required")).toBeInTheDocument();
    expect(mockedChangePassword).not.toHaveBeenCalled();
  });

  it("shows an error when passwords do not match", async () => {
    renderWithProviders(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: validValues.currentPassword },
    });
    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: validValues.newPassword },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "Different123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(mockedChangePassword).not.toHaveBeenCalled();
  });

  it("submits valid values, shows toast, and calls onSuccess", async () => {
    const onSuccess = jest.fn();
    mockedChangePassword.mockResolvedValueOnce({ success: true });

    renderWithProviders(<ChangePasswordForm onSuccess={onSuccess} />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(mockedChangePassword).toHaveBeenCalledTimes(1);
    });
    // TanStack Query v5 invokes the mutationFn with (variables, context),
    // so assert on the variables (first arg) only.
    expect(mockedChangePassword.mock.calls[0][0]).toEqual(validValues);
    expect(mockedToastSuccess).toHaveBeenCalledWith(
      "Password changed successfully. Please log in with your new credentials."
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockedLogout).toHaveBeenCalledTimes(1);
  });

  it("shows the server error when the service returns a failure", async () => {
    mockedChangePassword.mockResolvedValueOnce({
      success: false,
      error: "Current password is incorrect.",
    });

    renderWithProviders(<ChangePasswordForm />);

    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Current password is incorrect."
    );
    expect(mockedLogout).not.toHaveBeenCalled();
  });
});
