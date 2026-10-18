import { fireEvent, render, screen } from "@testing-library/react";
import { ApproveReviewDialog } from "../components/ApproveReviewDialog";

describe("ApproveReviewDialog", () => {
  function renderDialog(overrides: Partial<React.ComponentProps<typeof ApproveReviewDialog>> = {}) {
    const onConfirm = jest.fn();
    render(
      <ApproveReviewDialog
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

  it("confirms approval", () => {
    const { onConfirm } = renderDialog();

    expect(screen.getByText(/Acme Inc/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Approve review" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while the request is in flight", () => {
    renderDialog({ isPending: true });

    expect(screen.getByRole("button", { name: "Approve review" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
