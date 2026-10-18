import { render, screen } from "@testing-library/react"
import { JobDetail } from "../components/JobDetail"
import type { JobDetails } from "../types/job.types"

function buildJob(overrides: Partial<JobDetails> = {}): JobDetails {
  return {
    id: "job-1",
    title: "Backend Engineer",
    companyName: "Acme Corp",
    description: "Build and maintain backend services.",
    location: "Dhaka",
    employmentType: "FullTime",
    experienceLevel: "MidLevel",
    workArrangement: "OnSite",
    requiredSkills: ["C#"],
    vacancies: 2,
    createdAt: "2026-08-01T00:00:00Z",
    expireAt: "2099-01-01T00:00:00Z",
    status: "Published",
    ...overrides,
  }
}

describe("JobDetail — salary and requirements display", () => {
  it("shows Negotiable when salaryType is Negotiable", () => {
    render(<JobDetail job={buildJob({ salaryType: "Negotiable" })} showApply={false} />)

    expect(screen.getAllByText("Salary").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Negotiable").length).toBeGreaterThanOrEqual(1)
  })

  it("shows the formatted salary range when set", () => {
    render(
      <JobDetail
        job={buildJob({
          salaryType: "Range",
          salaryMin: 80000,
          salaryMax: 100000,
          salaryCurrency: "USD",
          salaryPeriod: "PerYear",
        })}
        showApply={false}
      />
    )

    expect(screen.getAllByText(/80,000.*100,000.*year/).length).toBeGreaterThanOrEqual(1)
  })

  it("does not show a Salary fact when salaryType is unset (pre-migration jobs)", () => {
    render(<JobDetail job={buildJob({ salaryType: undefined })} showApply={false} />)

    expect(screen.queryByText("Salary")).not.toBeInTheDocument()
  })

  it("renders the Requirements section when set", () => {
    render(
      <JobDetail
        job={buildJob({ requirements: "- 3-5 years of relevant experience" })}
        showApply={false}
      />
    )

    expect(screen.getByText("Requirements")).toBeInTheDocument()
    expect(screen.getByText("- 3-5 years of relevant experience")).toBeInTheDocument()
  })

  it("does not render the Requirements section when unset", () => {
    render(<JobDetail job={buildJob({ requirements: undefined })} showApply={false} />)

    expect(screen.queryByText("Requirements")).not.toBeInTheDocument()
  })
})

describe("JobDetail — backend-authoritative status display", () => {
  it.each([
    ["Published", "Active Opening"],
    ["Closed", "Closed"],
    ["Expired", "Expired"],
    ["Draft", "Draft"],
  ])("renders %s badge as %s", (status, label) => {
    render(<JobDetail job={buildJob({ status })} showApply={false} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('shows closed notice and hides apply link for Closed jobs', () => {
    render(<JobDetail job={buildJob({ status: "Closed" })} showApply={true} />)
    expect(screen.getByText("This job is closed")).toBeInTheDocument()
    expect(screen.queryByText("Apply for this role")).not.toBeInTheDocument()
  })

  it('shows expired notice and hides apply link for Expired jobs', () => {
    render(<JobDetail job={buildJob({ status: "Expired" })} showApply={true} />)
    expect(screen.getByText("Applications closed (Expired)")).toBeInTheDocument()
    expect(screen.queryByText("Apply for this role")).not.toBeInTheDocument()
  })

  it('shows apply button for Published jobs', () => {
    render(<JobDetail job={buildJob({ status: "Published" })} showApply={true} />)
    expect(screen.getByText("Apply for this role")).toBeInTheDocument()
  })

  it('renders no CTA when showApply is false', () => {
    render(<JobDetail job={buildJob({ status: "Published" })} showApply={false} />)
    expect(screen.queryByText("Apply for this role")).not.toBeInTheDocument()
  })
})

describe("JobDetail — layout overflow hardening (TX26-390)", () => {
  it("renders with break-words and [overflow-wrap:anywhere] on heading when title is unbroken", () => {
    const longUnbrokenTitle =
      "SeniorMachineLearningEngineerLeadArchitectFullStackDeveloperUnbrokenStringTest1234567890";
    const longUnbrokenCompany =
      "SuperLongUnbrokenCompanyNameTest123456789012345678901234567890";
    const { container } = render(
      <JobDetail
        job={buildJob({
          title: longUnbrokenTitle,
          companyName: longUnbrokenCompany,
        })}
        showApply={false}
      />
    );

    const headingElement = screen.getByRole("heading", { level: 1 });
    expect(headingElement).toHaveTextContent(longUnbrokenTitle);
    expect(headingElement).toHaveClass("break-words");
    expect(headingElement).toHaveClass("[overflow-wrap:anywhere]");

    const sidebarElement = container.querySelector("aside");
    expect(sidebarElement).toBeInTheDocument();
    expect(sidebarElement).toHaveClass("w-full");
    expect(sidebarElement).toHaveClass("lg:w-[320px]");
    expect(sidebarElement).toHaveClass("shrink-0");
  });
});
