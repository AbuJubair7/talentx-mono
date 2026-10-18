import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddPasswordDialog } from "../components/add-password-dialog";

jest.mock("../components/add-password-form", () => ({
  AddPasswordForm: ({ onSuccess }: { onSuccess?: () => void }) => (
    <div data-testid="add-password-form">
      <button type="button" onClick={onSuccess}>
        Simulate Success
      </button>
    </div>
  ),
}));

describe("AddPasswordDialog", () => {
  it("renders Add Password trigger button", () => {
    render(<AddPasswordDialog />);

    expect(screen.getByRole("button", { name: "Add Password" })).toBeInTheDocument();
  });

  it("invokes onPasswordAdded and closes dialog when form succeeds", () => {
    const onPasswordAddedCallback = jest.fn();
    render(<AddPasswordDialog onPasswordAdded={onPasswordAddedCallback} />);

    fireEvent.click(screen.getByRole("button", { name: "Add Password" }));

    expect(screen.getByTestId("add-password-form")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Simulate Success" }));

    expect(onPasswordAddedCallback).toHaveBeenCalledTimes(1);
  });
});
