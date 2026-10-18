import { fireEvent, render, screen } from "@testing-library/react";
import { DeactivateJobDialog } from "../components/DeactivateJobDialog";

const REASON_LABEL = "Misleading or invalid information";
const VALID_DETAILS = "The salary in the title doesn't match the posting.";

function renderDeactivateDialog(overrides: Partial<React.ComponentProps<typeof DeactivateJobDialog>> = {}) {
  const onConfirm = jest.fn();
  const onOpenChange = jest.fn();
  const utils = render(
    <DeactivateJobDialog
      open
      onOpenChange={onOpenChange}
      jobTitle="Senior Backend Engineer"
      isPending={false}
      onConfirm={onConfirm}
      {...overrides}
    />
  );
  return { ...utils, onConfirm, onOpenChange };
}

function fillReason(label = REASON_LABEL) {
  fireEvent.change(screen.getByLabelText("Reason"), {
    target: { value: screen.getByRole("option", { name: label }).getAttribute("value") },
  });
}

describe("DeactivateJobDialog", () => {
  it("lists every backend reason and starts with none selected", () => {
    renderDeactivateDialog();

    expect(screen.getByLabelText("Reason")).toHaveValue("");
    for (const label of [
      "Spam",
      "Inappropriate content",
      REASON_LABEL,
      "Discriminatory content",
      "Duplicate posting",
      "Outdated job",
      "Other",
    ]) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
    }
  });

  it("refuses to submit without a reason", () => {
    const { onConfirm } = renderDeactivateDialog();

    fireEvent.change(screen.getByLabelText("Details"), { target: { value: VALID_DETAILS } });
    fireEvent.click(screen.getByRole("button", { name: "Deactivate job" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Choose a reason.");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("refuses details that are too short once trimmed", () => {
    const { onConfirm } = renderDeactivateDialog();

    fillReason();
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: "   spam   " } });
    fireEvent.click(screen.getByRole("button", { name: "Deactivate job" }));

    expect(screen.getByRole("alert")).toHaveTextContent("at least 10 characters");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("clears the error as soon as the admin fixes the field", () => {
    renderDeactivateDialog();

    fireEvent.click(screen.getByRole("button", { name: "Deactivate job" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fillReason();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sends the reason with trimmed details", () => {
    const { onConfirm } = renderDeactivateDialog();

    fillReason();
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: `  ${VALID_DETAILS}  ` } });
    fireEvent.click(screen.getByRole("button", { name: "Deactivate job" }));

    expect(onConfirm).toHaveBeenCalledWith({
      reason: "MisleadingInformation",
      details: VALID_DETAILS,
    });
  });

  it("counts characters and caps them at the backend limit", () => {
    renderDeactivateDialog();
    const detailsField = screen.getByLabelText("Details");

    fireEvent.change(detailsField, { target: { value: VALID_DETAILS } });

    expect(screen.getByText(`${VALID_DETAILS.length} / 1000`)).toBeInTheDocument();
    expect(detailsField).toHaveAttribute("maxLength", "1000");
  });

  it("disables both buttons while the request is in flight", () => {
    renderDeactivateDialog({ isPending: true });

    expect(screen.getByRole("button", { name: "Deactivate job" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("uses repeat wording for a resubmitted job", () => {
    renderDeactivateDialog({ isRepeat: true });

    expect(screen.getByRole("heading", { name: "Deactivate this job again" })).toBeInTheDocument();
  });

  it("forgets what was typed after the dialog closes", () => {
    const { rerender } = renderDeactivateDialog();
    fillReason();
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: VALID_DETAILS } });

    rerender(
      <DeactivateJobDialog
        open={false}
        onOpenChange={jest.fn()}
        jobTitle="Senior Backend Engineer"
        isPending={false}
        onConfirm={jest.fn()}
      />
    );
    rerender(
      <DeactivateJobDialog
        open
        onOpenChange={jest.fn()}
        jobTitle="Senior Backend Engineer"
        isPending={false}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Reason")).toHaveValue("");
    expect(screen.getByLabelText("Details")).toHaveValue("");
  });
});
