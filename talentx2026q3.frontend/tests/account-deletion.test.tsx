import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteAccountDialog, sendDeleteAccountOtp } from "@/modules/auth/account-deletion";
import { DeleteAccountSettingsRow } from "@/app/(portal)/settings/components/delete-account-settings-row";
import { GoodbyeCooldownCleanup } from "@/app/(auth-flow)/goodbye/goodbye-cooldown-cleanup";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const mockSendOtp = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock("@/modules/auth/account-deletion/services/delete-account.service", () => ({
  sendDeleteAccountOtp: (...args: unknown[]) => mockSendOtp(...args),
  deleteAccount: (...args: unknown[]) => mockDeleteAccount(...args),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

function renderDialog(role: "talent" | "employer" = "talent") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DeleteAccountDialog role={role} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  mockSendOtp.mockResolvedValue({ success: true });
  mockDeleteAccount.mockResolvedValue({ success: false, error: "failed" });
});

describe("DeleteAccountDialog", () => {
  it("opens on the warning step with the role-specific talent warning", async () => {
    renderDialog("talent");

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

    expect(
      await screen.findByText("Your current applied job will be impacted by this action.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Delete your account?")
    ).toBeInTheDocument();
  });

  it("shows the employer-specific warning for employers", async () => {
    renderDialog("employer");

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

    expect(
      await screen.findByText(
        "Your current job posting will be removed from the public job listing by this action."
      )
    ).toBeInTheDocument();
  });

  it("keeps Continue disabled until the confirmation checkbox is ticked", async () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

    const continueButton = await screen.findByRole("button", { name: "Continue" });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox"));
    expect(continueButton).toBeEnabled();
  });

  it("moves to the OTP step and requests a code exactly once", async () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(screen.getByText("Confirm with email code")).toBeInTheDocument()
    );

    await waitFor(() => expect(mockSendOtp).toHaveBeenCalledTimes(1));
    expect(toast.success).toHaveBeenCalledWith(
      "A 6-digit verification code was sent to your email."
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() =>
      expect(screen.getByText("Confirm with email code")).toBeInTheDocument()
    );
    expect(mockSendOtp).toHaveBeenCalledTimes(1);
  });

  it("submits the entered OTP through the delete service", async () => {
    mockDeleteAccount.mockResolvedValue({ success: false, error: "Invalid code." });
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const otpInput = await screen.findByLabelText("Verification Code");
    expect(screen.getByRole("button", { name: "Delete My Account" })).toBeDisabled();

    fireEvent.change(otpInput, { target: { value: "123456" } });

    const deleteButton = screen.getByRole("button", { name: "Delete My Account" });
    await waitFor(() => expect(deleteButton).toBeEnabled());
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalled());
    expect(mockDeleteAccount.mock.calls[0][0]).toEqual(
      expect.objectContaining({ otp: "123456", isConfirmed: true })
    );
  });

  it("surfaces a server error from the delete service", async () => {
    mockDeleteAccount.mockResolvedValue({
      success: false,
      error: "Invalid or expired verification code.",
    });
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const otpInput = await screen.findByLabelText("Verification Code");
    fireEvent.change(otpInput, { target: { value: "000000" } });

    fireEvent.click(screen.getByRole("button", { name: "Delete My Account" }));

    expect(
      await screen.findByText("Invalid or expired verification code.")
    ).toBeInTheDocument();
  });

  it("closes the dialog when Cancel is clicked", async () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    expect(await screen.findByText("Delete your account?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Delete your account?")).not.toBeInTheDocument()
    );
  });

  it("resets the confirmation checkbox after Cancel and reopening", async () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByText("Delete your account?")).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    const reopenedCheckbox = await screen.findByRole("checkbox");
    expect(reopenedCheckbox).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("preserves cooldown and skips sending a new OTP when dialog is closed and reopened during active cooldown", async () => {
    renderDialog();

    // 1. First open: navigate to OTP step -> requests OTP
    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(screen.getByText("Confirm with email code")).toBeInTheDocument()
    );
    expect(mockSendOtp).toHaveBeenCalledTimes(1);

    // Verify resend cooldown is active
    expect(screen.getByRole("button", { name: /Resend in \d+s/ })).toBeDisabled();

    // 2. Close the dialog from OTP step
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByText("Delete your account?")).not.toBeInTheDocument()
    );

    // 3. Reopen the dialog and proceed to OTP step again
    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(screen.getByText("Confirm with email code")).toBeInTheDocument()
    );

    // Should NOT have called send OTP again!
    expect(mockSendOtp).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /Resend in \d+s/ })).toBeDisabled();
  });

  it("restores active cooldown across simulated page reload without sending a new OTP", async () => {
    // Simulate page reload where target expiration timestamp was stored in sessionStorage
    const futureExpiry = Date.now() + 45_000;
    sessionStorage.setItem(
      "talentx:delete_account_cooldown_until",
      futureExpiry.toString()
    );

    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(screen.getByText("Confirm with email code")).toBeInTheDocument()
    );

    // Since cooldown is active from storage, no API call is made
    expect(mockSendOtp).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Resend in (4[4-6])s/ })).toBeDisabled();
  });

  it("syncs frontend cooldown when backend rejects with cooldown error message", async () => {
    mockSendOtp.mockResolvedValue({
      success: false,
      error: "Please wait 42 seconds before requesting a new verification code.",
    });

    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(screen.getByText("Confirm with email code")).toBeInTheDocument()
    );

    expect(mockSendOtp).toHaveBeenCalledTimes(1);
    // Server error is displayed
    expect(
      await screen.findByText(
        "Please wait 42 seconds before requesting a new verification code."
      )
    ).toBeInTheDocument();

    // Timer synced to 42 seconds
    expect(screen.getByRole("button", { name: /Resend in (4[1-3])s/ })).toBeDisabled();
  });
});

describe("DeleteAccountSettingsRow", () => {
  it("renders the danger-zone row with a delete trigger", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <DeleteAccountSettingsRow role="talent" />
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("button", { name: "Delete Account" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Permanently delete your account and all associated data.")
    ).toBeInTheDocument();
  });

  it("renders the row for employer accounts as well", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <DeleteAccountSettingsRow role="employer" />
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("button", { name: "Delete Account" })
    ).toBeInTheDocument();
  });
});

describe("GoodbyeCooldownCleanup", () => {
  it("clears the persisted OTP cooldown after a successful deletion", () => {
    sessionStorage.setItem(
      "talentx:delete_account_cooldown_until",
      (Date.now() + 60_000).toString()
    );

    render(<GoodbyeCooldownCleanup />);

    expect(sessionStorage.getItem("talentx:delete_account_cooldown_until")).toBeNull();
  });
});

describe("cooldown expiry", () => {
  it("re-enables resend and re-requests the OTP after the cooldown expires", async () => {
    sessionStorage.setItem(
      "talentx:delete_account_cooldown_until",
      (Date.now() + 1200).toString()
    );

    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
    fireEvent.click(await screen.findByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(screen.getByText("Confirm with email code")).toBeInTheDocument()
    );

    // Cooldown is still active: no OTP call, resend disabled.
    expect(mockSendOtp).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Resend in \d+s/ })).toBeDisabled();

    // Wait past the stored expiry (1.2s) plus a full interval tick (1s).
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const resendButton = screen.getByRole("button", { name: "Resend code" });
    expect(resendButton).toBeEnabled();
    fireEvent.click(resendButton);

    await waitFor(() => expect(mockSendOtp).toHaveBeenCalledTimes(1));
  }, 10000);
});

describe("sendDeleteAccountOtp service", () => {
  it("is exposed for the dialog hook to call", () => {
    expect(typeof sendDeleteAccountOtp).toBe("function");
  });
});
