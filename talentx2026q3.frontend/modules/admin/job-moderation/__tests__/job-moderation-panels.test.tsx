import { render, screen, within } from "@testing-library/react";
import { DeactivationReasonPanel } from "../components/DeactivationReasonPanel";
import { EmployerContactCard } from "../components/EmployerContactCard";
import { ModerationHistory } from "../components/ModerationHistory";
import type { JobModerationHistoryEntry } from "../types/job-moderation";

describe("DeactivationReasonPanel", () => {
  it("renders nothing when the job has no active reason", () => {
    const { container } = render(
      <DeactivationReasonPanel status="Published" reasonLabel={null} details={null} deactivatedAt={null} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the reason label and the admin's details", () => {
    render(
      <DeactivationReasonPanel
        status="Deactivated"
        reasonLabel="Misleading or invalid information"
        details="Salary in the title doesn't match the posting."
        deactivatedAt="2026-09-10T08:00:00Z"
      />
    );

    expect(screen.getByText("Deactivated: Misleading or invalid information")).toBeInTheDocument();
    expect(screen.getByText("Salary in the title doesn't match the posting.")).toBeInTheDocument();
    expect(screen.queryByText(/resubmitted this job/)).not.toBeInTheDocument();
  });

  it("tells the admin to review the edits when the employer resubmitted", () => {
    render(
      <DeactivationReasonPanel
        status="PendingReview"
        reasonLabel="Spam"
        details="Links to an unrelated external site."
        deactivatedAt="2026-09-10T08:00:00Z"
      />
    );

    expect(screen.getByText(/The employer edited and resubmitted this job/)).toBeInTheDocument();
  });
});

describe("EmployerContactCard", () => {
  it("shows the employer with a mailto link", () => {
    render(<EmployerContactCard companyName="Acme Corp" employerName="Riley Chen" employerEmail="riley@acme.com" />);

    expect(screen.getByText("Riley Chen")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /riley@acme\.com/ })).toHaveAttribute("href", "mailto:riley@acme.com");
  });

  it("says the account is missing when the backend sends empty strings", () => {
    render(<EmployerContactCard companyName="Acme Corp" employerName="" employerEmail="" />);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Employer account not found")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("ModerationHistory", () => {
  const entries: JobModerationHistoryEntry[] = [
    {
      id: "h1",
      action: "Deactivated",
      fromStatus: "Published",
      toStatus: "Deactivated",
      reason: "Spam",
      reasonLabel: "Spam",
      details: "Links to an unrelated external site.",
      actorEmail: "admin@talentx.com",
      createdAt: "2026-09-10T08:00:00Z",
    },
    {
      id: "h3",
      action: "Reactivated",
      fromStatus: "PendingReview",
      toStatus: "Published",
      reason: null,
      reasonLabel: null,
      details: null,
      actorEmail: "admin@talentx.com",
      createdAt: "2026-09-12T08:00:00Z",
    },
    {
      id: "h2",
      action: "ResubmittedForReview",
      fromStatus: "Deactivated",
      toStatus: "PendingReview",
      reason: null,
      reasonLabel: null,
      details: null,
      actorEmail: "riley@acme.com",
      createdAt: "2026-09-11T08:00:00Z",
    },
  ];

  it("lists entries newest first, whatever order the API sends", () => {
    render(<ModerationHistory entries={entries} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => within(item).getAllByText(/./)[0].textContent)).toEqual([
      "Reactivated",
      "Resubmitted for review",
      "Deactivated",
    ]);
  });

  it("shows who acted and the reason only on deactivations", () => {
    render(<ModerationHistory entries={entries} />);
    const [reactivated, resubmitted, deactivated] = screen.getAllByRole("listitem");

    expect(within(resubmitted).getByText("by riley@acme.com")).toBeInTheDocument();
    expect(within(deactivated).getByText("Spam")).toBeInTheDocument();
    expect(within(deactivated).getByText("Links to an unrelated external site.")).toBeInTheDocument();
    expect(within(reactivated).queryByText("Spam")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing has happened yet", () => {
    render(<ModerationHistory entries={[]} />);

    expect(screen.getByText("No moderation actions yet.")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
