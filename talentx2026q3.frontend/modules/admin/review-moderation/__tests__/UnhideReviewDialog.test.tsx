import { fireEvent, render, screen } from "@testing-library/react";
import { UnhideReviewDialog } from "../components/UnhideReviewDialog";

describe("UnhideReviewDialog", () => {
  function renderDialog(overrides: Partial<React.ComponentProps<typeof UnhideReviewDialog>> = {}) {
    const onConfirm = jest.fn();
    render(
      <UnhideReviewDialog
        open
        onOpenChange={jest.fn()}
        companyName="Acme Inc"
        isPending={false}
        onConfirm={onConfirm}
        {...overrides}
      />
    );
    return { onConfirm };
  }

  it("confirms unhiding", () => {
    const { onConfirm } = renderDialog();

    expect(screen.getByText(/Acme Inc/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Unhide review" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while the request is in flight", () => {
    renderDialog({ isPending: true });

    expect(screen.getByRole("button", { name: "Unhide review" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
