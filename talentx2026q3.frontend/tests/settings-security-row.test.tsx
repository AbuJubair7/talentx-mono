import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SecuritySettingsRow } from "@/app/(portal)/settings/components/security-settings-row";

jest.mock("@/modules/auth/add-password/components/add-password-dialog", () => ({
  AddPasswordDialog: ({ onPasswordAdded }: { onPasswordAdded?: () => void }) => (
    <button type="button" onClick={onPasswordAdded}>
      Add Password
    </button>
  ),
}));

jest.mock("@/modules/auth/change-password/components/change-password-dialog", () => ({
  ChangePasswordDialog: () => (
    <button type="button">Change Password</button>
  ),
}));

describe("SecuritySettingsRow", () => {
  it("shows Change Password when initialHasPassword is true", () => {
    render(<SecuritySettingsRow initialHasPassword={true} />);

    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Change the password used to sign in.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change Password" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Password" })).not.toBeInTheDocument();
  });

  it("shows Change Password by default when initialHasPassword is omitted", () => {
    render(<SecuritySettingsRow />);

    expect(screen.getByText("Change the password used to sign in.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change Password" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Password" })).not.toBeInTheDocument();
  });

  it("shows Add Password when initialHasPassword is false", () => {
    render(<SecuritySettingsRow initialHasPassword={false} />);

    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(
      screen.getByText("Add a password to enable email and password sign in.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Password" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change Password" })).not.toBeInTheDocument();
  });

  it("switches to Change Password in-place when onPasswordAdded is triggered", () => {
    render(<SecuritySettingsRow initialHasPassword={false} />);

    const addPasswordButton = screen.getByRole("button", { name: "Add Password" });
    expect(addPasswordButton).toBeInTheDocument();
    expect(
      screen.getByText("Add a password to enable email and password sign in.")
    ).toBeInTheDocument();

    fireEvent.click(addPasswordButton);

    expect(screen.getByRole("button", { name: "Change Password" })).toBeInTheDocument();
    expect(screen.getByText("Change the password used to sign in.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Password" })).not.toBeInTheDocument();
  });
});
