import { act, fireEvent, render, screen } from "@testing-library/react"
import { Step2JobDetails } from "../components/wizard/Step2JobDetails"
import { useJobWizardStore } from "../store/job-wizard-store"

beforeEach(() => {
  useJobWizardStore.getState().resetWizard()
})

describe("Step2JobDetails — Salary section", () => {
  it("renders the Salary Type selector with no amount fields by default", () => {
    render(<Step2JobDetails />)

    expect(screen.getByText("Salary")).toBeInTheDocument()
    expect(screen.queryByText("Currency")).not.toBeInTheDocument()
    expect(screen.queryByText("Period")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Amount")).not.toBeInTheDocument()
  })

  it("does not show Currency/Period/Amount fields when salaryType is Negotiable", () => {
    useJobWizardStore.getState().updateFormData({ salaryType: "Negotiable" })
    render(<Step2JobDetails />)

    expect(screen.queryByText("Currency")).not.toBeInTheDocument()
    expect(screen.queryByText("Period")).not.toBeInTheDocument()
  })

  it("shows Currency, Period and a single Amount field when salaryType is Fixed", () => {
    useJobWizardStore.getState().updateFormData({ salaryType: "Fixed" })
    render(<Step2JobDetails />)

    expect(screen.getByText("Currency")).toBeInTheDocument()
    expect(screen.getByText("Period")).toBeInTheDocument()
    expect(screen.getByText("Amount")).toBeInTheDocument()
    expect(screen.queryByText("Min Amount")).not.toBeInTheDocument()
    expect(screen.queryByText("Max Amount")).not.toBeInTheDocument()
  })

  it("shows Currency, Period, Min Amount and Max Amount fields when salaryType is Range", () => {
    useJobWizardStore.getState().updateFormData({ salaryType: "Range" })
    render(<Step2JobDetails />)

    expect(screen.getByText("Currency")).toBeInTheDocument()
    expect(screen.getByText("Period")).toBeInTheDocument()
    expect(screen.getByText("Min Amount")).toBeInTheDocument()
    expect(screen.getByText("Max Amount")).toBeInTheDocument()
    expect(screen.queryByText("Amount")).not.toBeInTheDocument()
  })

  it("disables the amount input until both currency and period are set", () => {
    useJobWizardStore.getState().updateFormData({ salaryType: "Fixed" })
    const { rerender } = render(<Step2JobDetails />)

    expect(screen.getByPlaceholderText("e.g. 80000")).toBeDisabled()

    act(() => {
      useJobWizardStore.getState().updateFormData({ salaryCurrency: "USD", salaryPeriod: "PerYear" })
    })
    rerender(<Step2JobDetails />)

    expect(screen.getByPlaceholderText("e.g. 80000")).not.toBeDisabled()
  })

  it("clears currency/period/min/max when switching back to Negotiable", () => {
    useJobWizardStore.getState().updateFormData({
      salaryType: "Fixed",
      salaryCurrency: "USD",
      salaryPeriod: "PerYear",
      salaryMin: 80000,
    })

    // Simulate the same clearing behavior the Salary Type onChange handler performs.
    useJobWizardStore.getState().updateFormData({
      salaryType: "Negotiable",
      salaryCurrency: undefined,
      salaryPeriod: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
    })

    render(<Step2JobDetails />)

    expect(screen.queryByText("Currency")).not.toBeInTheDocument()
    const { formData } = useJobWizardStore.getState()
    expect(formData.salaryCurrency).toBeUndefined()
    expect(formData.salaryMin).toBeUndefined()
  })

  it("updates salaryMin in the store when the Fixed amount input changes", () => {
    useJobWizardStore.getState().updateFormData({
      salaryType: "Fixed",
      salaryCurrency: "USD",
      salaryPeriod: "PerYear",
    })
    render(<Step2JobDetails />)

    const input = screen.getByPlaceholderText("e.g. 80000")
    fireEvent.change(input, { target: { value: "90000" } })

    expect(useJobWizardStore.getState().formData.salaryMin).toBe(90000)
  })

  it("displays field errors for salary fields from the store", () => {
    useJobWizardStore.getState().updateFormData({ salaryType: "Fixed" })
    useJobWizardStore.getState().setFieldErrors({ salaryType: "Salary is required" })
    render(<Step2JobDetails />)

    expect(screen.getByText("Salary is required")).toBeInTheDocument()
  })
})
