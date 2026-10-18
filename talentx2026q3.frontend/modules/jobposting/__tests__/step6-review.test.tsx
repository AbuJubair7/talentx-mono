import { render, screen } from "@testing-library/react"
import { Step6Review } from "../components/wizard/Step6Review"
import { useJobWizardStore } from "../store/job-wizard-store"

beforeEach(() => {
  useJobWizardStore.getState().resetWizard()
})

describe("Step6Review", () => {
  it("renders review heading", () => {
    render(<Step6Review />)
    expect(screen.getByText("Review & Publish")).toBeInTheDocument()
  })

  it("renders publish readiness indicator", () => {
    render(<Step6Review />)
    expect(screen.getByText("Publish Readiness")).toBeInTheDocument()
  })

  it("renders review sections", () => {
    render(<Step6Review />)
    expect(screen.getByText("Role Basics")).toBeInTheDocument()
    expect(screen.getByText("Job Details")).toBeInTheDocument()
    expect(screen.getAllByText("Location").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Skills")).toBeInTheDocument()
    expect(screen.getAllByText("Description").length).toBeGreaterThanOrEqual(1)
  })

  it("renders publish requirements checklist", () => {
    render(<Step6Review />)
    expect(screen.getByText("Publish Requirements")).toBeInTheDocument()
    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Company name")).toBeInTheDocument()
    expect(screen.getAllByText("Description").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Required skills")).toBeInTheDocument()
  })

  it("displays form data from store", () => {
    useJobWizardStore.getState().updateFormData({
      title: "Backend Engineer",
      companyName: "Acme Corp",
    })
    render(<Step6Review />)

    expect(screen.getByText("Backend Engineer")).toBeInTheDocument()
    expect(screen.getByText("Acme Corp")).toBeInTheDocument()
  })

  it("shows city/country in location section for OnSite", () => {
    useJobWizardStore.getState().updateFormData({
      workArrangement: "OnSite",
      city: "Dhaka",
      country: "Bangladesh",
    })
    render(<Step6Review />)

    expect(screen.getByText("Dhaka")).toBeInTheDocument()
    expect(screen.getByText("Bangladesh")).toBeInTheDocument()
  })

  it("shows minOverlapHours in location section for FullRemote", () => {
    useJobWizardStore.getState().updateFormData({
      workArrangement: "FullRemote",
      minOverlapHours: 4,
    })
    render(<Step6Review />)

    expect(screen.getByText("4 hours")).toBeInTheDocument()
  })

  it("renders skill tags", () => {
    useJobWizardStore.getState().updateFormData({
      requiredSkills: ["C#", "SQL"],
    })
    render(<Step6Review />)

    expect(screen.getByText("C#")).toBeInTheDocument()
    expect(screen.getByText("SQL")).toBeInTheDocument()
  })

  it("includes Salary and Requirements in the publish requirements checklist", () => {
    render(<Step6Review />)

    expect(screen.getByText("Salary")).toBeInTheDocument()
    expect(screen.getAllByText("Requirements").length).toBeGreaterThanOrEqual(1)
  })

  it("shows Negotiable in the review summary when salary is unset", () => {
    render(<Step6Review />)

    expect(screen.getByText("Negotiable")).toBeInTheDocument()
  })

  it("shows the formatted salary range in the review summary when set", () => {
    useJobWizardStore.getState().updateFormData({
      salaryType: "Range",
      salaryCurrency: "USD",
      salaryPeriod: "PerYear",
      salaryMin: 80000,
      salaryMax: 100000,
    })
    render(<Step6Review />)

    expect(screen.getByText(/80,000.*100,000.*year/)).toBeInTheDocument()
  })

  it("shows the requirements text in the review summary when set", () => {
    useJobWizardStore.getState().updateFormData({
      requirements: "- 3-5 years of relevant experience",
    })
    render(<Step6Review />)

    expect(screen.getByText("- 3-5 years of relevant experience")).toBeInTheDocument()
  })

  it("renders the combined Description & Requirements section title", () => {
    render(<Step6Review />)

    expect(screen.getByText("Description & Requirements")).toBeInTheDocument()
  })
})
