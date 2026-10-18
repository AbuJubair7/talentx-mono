import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Step1JobTitle } from "../components/wizard/Step1JobTitle"
import { useJobWizardStore } from "../store/job-wizard-store"

// Mock useCurrentEmployer
jest.mock("../hooks/useCurrentEmployer", () => ({
  useCurrentEmployer: jest.fn(),
}))

import { useCurrentEmployer } from "../hooks/useCurrentEmployer"
const mockedUseCurrentEmployer = jest.mocked(useCurrentEmployer)

beforeEach(() => {
  useJobWizardStore.getState().resetWizard()
  mockedUseCurrentEmployer.mockReturnValue({
    data: undefined,
    isLoading: false,
  } as any)
})

describe("Step1JobTitle", () => {
  it("renders job title and company name fields", () => {
    render(<Step1JobTitle />)

    expect(screen.getByLabelText(/Job Title/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Company Name/)).toBeInTheDocument()
  })

  it("renders step heading", () => {
    render(<Step1JobTitle />)
    expect(screen.getByText("Job Title & Company")).toBeInTheDocument()
  })

  it("updates title in store on input", async () => {
    const user = userEvent.setup()
    render(<Step1JobTitle />)

    const titleInput = screen.getByLabelText(/Job Title/)
    await user.type(titleInput, "Frontend")

    expect(useJobWizardStore.getState().formData.title).toBe("Frontend")
  })

  it("auto-fills company name from employer profile", () => {
    mockedUseCurrentEmployer.mockReturnValue({
      data: { id: "employer-1", companyName: "Acme Corp" },
      isLoading: false,
    } as any)

    render(<Step1JobTitle />)

    const companyInput = screen.getByLabelText(/Company Name/) as HTMLInputElement
    expect(companyInput.value).toBe("Acme Corp")
  })

  it("makes company name read-only when auto-filled", () => {
    mockedUseCurrentEmployer.mockReturnValue({
      data: { id: "employer-1", companyName: "Acme Corp" },
      isLoading: false,
    } as any)

    render(<Step1JobTitle />)

    const companyInput = screen.getByLabelText(/Company Name/) as HTMLInputElement
    expect(companyInput.readOnly).toBe(true)
  })

  it("shows auto-fill hint when employer data is loaded", () => {
    mockedUseCurrentEmployer.mockReturnValue({
      data: { id: "employer-1", companyName: "Acme Corp" },
      isLoading: false,
    } as any)

    render(<Step1JobTitle />)
    expect(screen.getByText("Auto-filled from your profile")).toBeInTheDocument()
  })

  it("allows manual company name entry when no employer data", () => {
    render(<Step1JobTitle />)

    const companyInput = screen.getByLabelText(/Company Name/) as HTMLInputElement
    expect(companyInput.readOnly).toBe(false)
  })

  it("displays field errors from store", () => {
    useJobWizardStore.getState().setFieldErrors({ title: "Title is required" })
    render(<Step1JobTitle />)

    expect(screen.getByText("Title is required")).toBeInTheDocument()
  })
})
