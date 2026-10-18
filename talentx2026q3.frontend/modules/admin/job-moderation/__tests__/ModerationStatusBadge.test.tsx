import { render, screen } from "@testing-library/react";
import { ModerationStatusBadge } from "../components/ModerationStatusBadge";

describe("ModerationStatusBadge", () => {
  it.each([
    ["PendingReview", "Under review", "text-amber-700"],
    ["Deactivated", "Deactivated", "text-rose-700"],
    ["Published", "Published", "text-emerald-700"],
  ] as const)("renders %s as '%s'", (status, label, colorClass) => {
    render(<ModerationStatusBadge status={status} />);

    expect(screen.getByText(label)).toHaveClass(colorClass);
  });

  it("shows a published job past its deadline as Expired", () => {
    render(<ModerationStatusBadge status="Published" isExpired />);

    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(screen.queryByText("Published")).not.toBeInTheDocument();
  });

  it("keeps the moderation status when a deactivated job is also expired", () => {
    // Moderation outranks expiry: the admin's decision is what the reviewer needs to see.
    render(<ModerationStatusBadge status="Deactivated" isExpired />);

    expect(screen.getByText("Deactivated")).toBeInTheDocument();
    expect(screen.queryByText("Expired")).not.toBeInTheDocument();
  });
});
