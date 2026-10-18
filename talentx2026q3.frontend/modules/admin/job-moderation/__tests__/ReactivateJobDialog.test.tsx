import { fireEvent, render, screen } from "@testing-library/react";
import { ReactivateJobDialog } from "../components/ReactivateJobDialog";

describe("ReactivateJobDialog", () => {
  function renderReactivateDialog(
    overrides: Partial<React.ComponentProps<typeof ReactivateJobDialog>> = {}
  ) {
    const onConfirm = jest.fn();
    render(
      <ReactivateJobDialog
        open
        onOpenChange={jest.fn()}
        jobTitle="Senior Backend Engineer"
        isExpired={false}
        isPending={false}
        onConfirm={onConfirm}
        {...overrides}
      />
    );
    return { onConfirm };
  }

  it("confirms reactivation", () => {
    const { onConfirm } = renderReactivateDialog();

    expect(screen.getByText(/The employer is emailed/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reactivate job" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls a resubmitted job's reactivation an approval", () => {
    renderReactivateDialog({ isApproval: true });

    expect(screen.getByRole("heading", { name: "Approve & reactivate job" })).toBeInTheDocument();
  });

  it("blocks reactivation of an expired job and explains why", () => {
    const { onConfirm } = renderReactivateDialog({ isExpired: true });

    expect(screen.getByRole("alert")).toHaveTextContent("deadline has passed");
    const confirmButton = screen.getByRole("button", { name: "Reactivate job" });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables both buttons while the request is in flight", () => {
    renderReactivateDialog({ isPending: true });

    expect(screen.getByRole("button", { name: "Reactivate job" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
