import { fireEvent, render, screen } from "@testing-library/react";
import { ReviewModerationTable } from "../components/ReviewModerationTable";
import type { AdminCompanyReviewListItem } from "../types/review-moderation";

function buildItem(overrides: Partial<AdminCompanyReviewListItem> = {}): AdminCompanyReviewListItem {
  return {
    id: "review-1",
    status: "Pending",
    sentiment: "Positive",
    comment: "Great process overall.",
    ratings: { recruitmentProcess: 4, communication: 4, interviewExperience: null, professionalism: 5 },
    companyId: "company-1",
    companyName: "Acme Inc",
    jobTitle: "Backend Engineer",
    reviewerName: "Jordan Smith",
    reviewerEmail: "jordan.smith@ait.com",
    reviewerUserId: "user-1",
    submittedAt: "2026-09-20T00:00:00Z",
    updatedAt: null,
    publishedAt: null,
    moderationReason: null,
    moderationDetails: null,
    moderatedAt: null,
    ...overrides,
  };
}

const noop = () => {};

function renderTable(items: AdminCompanyReviewListItem[], overrides: Partial<React.ComponentProps<typeof ReviewModerationTable>> = {}) {
  const onView = jest.fn();
  const onApprove = jest.fn();
  const onReject = jest.fn();
  const onHide = jest.fn();
  const onUnhide = jest.fn();
  render(
    <ReviewModerationTable
      items={items}
      isLoading={false}
      onView={onView}
      onApprove={onApprove}
      onReject={onReject}
      onHide={onHide}
      onUnhide={onUnhide}
      {...overrides}
    />
  );
  return { onView, onApprove, onReject, onHide, onUnhide };
}

describe("ReviewModerationTable", () => {
  it.each([
    ["Pending", ["Approve", "Reject"], ["Hide", "Unhide"]],
    ["Published", ["Hide"], ["Approve", "Reject", "Unhide"]],
    ["Hidden", ["Unhide"], ["Approve", "Reject", "Hide"]],
    ["Rejected", [], ["Approve", "Reject", "Hide", "Unhide"]],
    ["Withdrawn", [], ["Approve", "Reject", "Hide", "Unhide"]],
  ] as const)("shows the right actions for a %s review", (status, expected, notExpected) => {
    renderTable([buildItem({ status })]);

    for (const name of expected) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    for (const name of notExpected) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
  });

  it("shows 'View only' for statuses with no actions", () => {
    renderTable([buildItem({ status: "Rejected" })]);

    expect(screen.getByText("View only")).toBeInTheDocument();
  });

  it("calls onApprove/onReject with the row's item", () => {
    const item = buildItem({ status: "Pending" });
    const { onApprove, onReject } = renderTable([item]);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalledWith(item);

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(onReject).toHaveBeenCalledWith(item);
  });

  it("calls onHide with the row's item and does not also trigger onView", () => {
    const item = buildItem({ status: "Published" });
    const { onHide, onView } = renderTable([item]);

    fireEvent.click(screen.getByRole("button", { name: "Hide" }));

    expect(onHide).toHaveBeenCalledWith(item);
    expect(onView).not.toHaveBeenCalled();
  });

  it("calls onUnhide with the row's item", () => {
    const item = buildItem({ status: "Hidden" });
    const { onUnhide } = renderTable([item]);

    fireEvent.click(screen.getByRole("button", { name: "Unhide" }));

    expect(onUnhide).toHaveBeenCalledWith(item);
  });

  it("opens the detail view when a row is clicked", () => {
    const item = buildItem();
    const { onView } = renderTable([item]);

    fireEvent.click(screen.getByRole("button", { name: `View details for review of ${item.companyName}` }));

    expect(onView).toHaveBeenCalledWith(item.id);
  });

  it("renders company, job title, sentiment, comment and reviewer identity", () => {
    renderTable([buildItem()]);

    expect(screen.getByText("Acme Inc")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Positive")).toBeInTheDocument();
    expect(screen.getByText("Great process overall.")).toBeInTheDocument();
    expect(screen.getByText("Jordan Smith")).toBeInTheDocument();
    expect(screen.getByText("jordan.smith@ait.com")).toBeInTheDocument();
  });

  it("shows a loading state", () => {
    render(
      <ReviewModerationTable
        items={[]}
        isLoading
        onView={noop}
        onApprove={noop}
        onReject={noop}
        onHide={noop}
        onUnhide={noop}
      />
    );

    expect(screen.queryByText("No matching reviews found.")).not.toBeInTheDocument();
  });

  it("shows an empty state", () => {
    renderTable([]);

    expect(screen.getByText("No matching reviews found.")).toBeInTheDocument();
  });

  it("shows an error state with a retry action", () => {
    const onRetry = jest.fn();
    renderTable([], { isError: true, onRetry });

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
