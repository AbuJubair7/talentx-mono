import { fireEvent, render, screen } from "@testing-library/react";
import { AdminSettingsView } from "../components/AdminSettingsView";

jest.mock("../components/AiConfigForm", () => ({
  AiConfigForm: () => <div data-testid="ai-config-form">AI Config Form Mock</div>,
}));

jest.mock("@/modules/admin/interview-prep-config", () => ({
  InterviewPrepConfigForm: () => (
    <div data-testid="interview-prep-form">Interview Prep Form Mock</div>
  ),
}));

describe("AdminSettingsView", () => {
  it("renders with Interview Preparation tab active by default", () => {
    render(<AdminSettingsView />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByTestId("interview-prep-form")).toBeInTheDocument();
    expect(screen.queryByTestId("ai-config-form")).not.toBeInTheDocument();
  });

  it("switches to AI Configuration tab and renders AiConfigForm", () => {
    render(<AdminSettingsView />);

    const aiConfigTab = screen.getByRole("button", { name: /AI Configuration/i });
    fireEvent.click(aiConfigTab);

    expect(screen.getByTestId("ai-config-form")).toBeInTheDocument();
    expect(screen.queryByTestId("interview-prep-form")).not.toBeInTheDocument();
  });
});
