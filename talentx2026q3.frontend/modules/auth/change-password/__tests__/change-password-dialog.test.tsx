import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangePasswordDialog } from "../components/change-password-dialog";

jest.mock("../components/change-password-form", () => ({
  ChangePasswordForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="change-password-form">
      <button type="button" onClick={onSuccess}>
        Simulate Success
      </button>
    </div>
  ),
}));

describe("ChangePasswordDialog", () => {
  it("renders Change Password trigger button", () => {
    render(<ChangePasswordDialog />);

    expect(screen.getByRole("button", { name: "Change Password" })).toBeInTheDocument();
  });

  it("opens the dialog and closes it when the form succeeds", () => {
    render(<ChangePasswordDialog />);

    fireEvent.click(screen.getByRole("button", { name: "Change Password" }));

    expect(screen.getByTestId("change-password-form")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Success" }));

    expect(screen.queryByTestId("change-password-form")).not.toBeInTheDocument();
  });
});
