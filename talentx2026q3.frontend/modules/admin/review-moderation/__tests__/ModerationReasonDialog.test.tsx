import { fireEvent, render, screen } from "@testing-library/react";
import { ModerationReasonDialog } from "../components/ModerationReasonDialog";

const REASON_LABEL = "Personal information";
const VALID_DETAILS = "Contains the employer's home address.";

function renderDialog(overrides: Partial<React.ComponentProps<typeof ModerationReasonDialog>> = {}) {
  const onConfirm = jest.fn();
  const onOpenChange = jest.fn();
  const utils = render(
    <ModerationReasonDialog
      open
      onOpenChange={onOpenChange}
      action="reject"
      companyName="Acme Inc"
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

describe("ModerationReasonDialog", () => {
  it("lists every backend reason and starts with none selected", () => {
    renderDialog();

    expect(screen.getByLabelText("Reason")).toHaveValue("");
    for (const label of [
      "Spam",
      "Inappropriate content",
      REASON_LABEL,
      "False or misleading",
      "Off topic",
      "Other",
    ]) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
    }
  });

  it("shows Reject copy for the reject action", () => {
    renderDialog({ action: "reject" });

    expect(screen.getByRole("heading", { name: "Reject review" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject review" })).toBeInTheDocument();
  });

  it("shows Hide copy for the hide action", () => {
    renderDialog({ action: "hide" });

    expect(screen.getByRole("heading", { name: "Hide review" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide review" })).toBeInTheDocument();
  });

  it("refuses to submit without a reason", () => {
    const { onConfirm } = renderDialog();

    fireEvent.change(screen.getByLabelText("Details"), { target: { value: VALID_DETAILS } });
    fireEvent.click(screen.getByRole("button", { name: "Reject review" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Choose a reason.");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("refuses details that are too short once trimmed", () => {
    const { onConfirm } = renderDialog();

    fillReason();
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: "   spam   " } });
    fireEvent.click(screen.getByRole("button", { name: "Reject review" }));

    expect(screen.getByRole("alert")).toHaveTextContent("at least 10 characters");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("clears the error as soon as the admin fixes the field", () => {
    renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Reject review" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fillReason();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("sends the reason with trimmed details", () => {
    const { onConfirm } = renderDialog();

    fillReason();
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: `  ${VALID_DETAILS}  ` } });
    fireEvent.click(screen.getByRole("button", { name: "Reject review" }));

    expect(onConfirm).toHaveBeenCalledWith({
      reason: "PersonalInformation",
      details: VALID_DETAILS,
    });
  });

  it("states that the explanation is shown to the reviewer", () => {
    renderDialog();

    expect(screen.getByText("This explanation is shown to the reviewer.")).toBeInTheDocument();
  });

  it("counts characters and caps them at the backend limit", () => {
    renderDialog();
    const detailsField = screen.getByLabelText("Details");

    fireEvent.change(detailsField, { target: { value: VALID_DETAILS } });

    expect(screen.getByText(`${VALID_DETAILS.length} / 1000`)).toBeInTheDocument();
    expect(detailsField).toHaveAttribute("maxLength", "1000");
  });

  it("disables both buttons while the request is in flight", () => {
    renderDialog({ isPending: true });

    expect(screen.getByRole("button", { name: "Reject review" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("forgets what was typed after the dialog closes", () => {
    const { rerender } = renderDialog();
    fillReason();
    fireEvent.change(screen.getByLabelText("Details"), { target: { value: VALID_DETAILS } });

    rerender(
      <ModerationReasonDialog
        open={false}
        onOpenChange={jest.fn()}
        action="reject"
        companyName="Acme Inc"
        isPending={false}
        onConfirm={jest.fn()}
      />
    );
    rerender(
      <ModerationReasonDialog
        open
        onOpenChange={jest.fn()}
        action="reject"
        companyName="Acme Inc"
        isPending={false}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Reason")).toHaveValue("");
    expect(screen.getByLabelText("Details")).toHaveValue("");
  });
});
