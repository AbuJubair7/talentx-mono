import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Step5Description } from "../components/wizard/Step5Description"
import { useJobWizardStore } from "../store/job-wizard-store"

const mockGenerateDescription = jest.fn()
const mockGenerateRequirements = jest.fn()

jest.mock("../hooks/useGenerateDescription", () => ({
  useGenerateDescription: () => ({
    mutate: (...args: unknown[]) => mockGenerateDescription(...args),
    isPending: false,
  }),
}))

jest.mock("../hooks/useGenerateRequirements", () => ({
  useGenerateRequirements: () => ({
    mutate: (...args: unknown[]) => mockGenerateRequirements(...args),
    isPending: false,
  }),
}))

beforeEach(() => {
  mockGenerateDescription.mockReset()
  mockGenerateRequirements.mockReset()
  useJobWizardStore.getState().resetWizard()
})

describe("Step5Description", () => {
  it("renders description heading", () => {
    render(<Step5Description />)
    expect(screen.getByText("Job Description")).toBeInTheDocument()
  })

  it("renders AI generate button", () => {
    render(<Step5Description />)
    expect(screen.getByText("Generate Description")).toBeInTheDocument()
  })

  it("renders description textarea", () => {
    render(<Step5Description />)
    expect(
      screen.getByPlaceholderText("Describe the role, responsibilities, and requirements.")
    ).toBeInTheDocument()
  })

  it("shows character count", () => {
    render(<Step5Description />)
    expect(screen.getByText("0 / 10000")).toBeInTheDocument()
  })

  it("updates character count on input", async () => {
    const user = userEvent.setup()
    render(<Step5Description />)

    const textarea = screen.getByPlaceholderText(
      "Describe the role, responsibilities, and requirements."
    )
    await user.type(textarea, "Hello World")

    expect(screen.getByText("11 / 10000")).toBeInTheDocument()
  })

  it("updates description in store on input", async () => {
    const user = userEvent.setup()
    render(<Step5Description />)

    const textarea = screen.getByPlaceholderText(
      "Describe the role, responsibilities, and requirements."
    )
    await user.type(textarea, "This is a detailed job description for the role.")

    expect(useJobWizardStore.getState().formData.description).toBe(
      "This is a detailed job description for the role."
    )
  })

  it("displays field errors from store", () => {
    useJobWizardStore.getState().setFieldErrors({ description: "Description is required" })
    render(<Step5Description />)

    expect(screen.getByText("Description is required")).toBeInTheDocument()
  })

  it("renders requirements heading, AI generate button and textarea", () => {
    render(<Step5Description />)
    expect(screen.getByRole("heading", { name: "Requirements" })).toBeInTheDocument()
    expect(screen.getByText("Generate Requirements")).toBeInTheDocument()
    expect(screen.getByText("0 / 5000")).toBeInTheDocument()
  })

  it("updates requirements in store on input", async () => {
    const user = userEvent.setup()
    render(<Step5Description />)

    const textarea = screen.getByPlaceholderText(/3-5 years of relevant experience/)
    await user.type(textarea, "Bachelor's degree required.")

    expect(useJobWizardStore.getState().formData.requirements).toBe(
      "Bachelor's degree required."
    )
  })

  it("displays requirements field errors from store", () => {
    useJobWizardStore.getState().setFieldErrors({ requirements: "Requirements is required" })
    render(<Step5Description />)

    expect(screen.getByText("Requirements is required")).toBeInTheDocument()
  })

  it("hints that description and requirements can be generated and edited", () => {
    render(<Step5Description />)
    expect(screen.getByText(/Use Generate Description for an AI draft — you can edit it/)).toBeInTheDocument()
    expect(screen.getByText(/Use Generate Requirements for an AI draft — you can edit it/)).toBeInTheDocument()
    expect(screen.queryByText(/AI-generated\./)).not.toBeInTheDocument()
  })

  it("switches only the description button to Regenerate after generating a description", async () => {
    const user = userEvent.setup()
    mockGenerateDescription.mockImplementation((_request, options) =>
      options.onSuccess({ description: "An AI-written job description." })
    )
    render(<Step5Description />)

    await user.click(screen.getByRole("button", { name: "Generate Description" }))

    expect(useJobWizardStore.getState().formData.description).toBe("An AI-written job description.")
    expect(screen.getByRole("button", { name: "Regenerate Description" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Generate Requirements" })).toBeInTheDocument()
    expect(screen.getByText(/AI-generated\. Edit the text freely/)).toBeInTheDocument()
  })

  it("switches the requirements button to Regenerate after generating requirements", async () => {
    const user = userEvent.setup()
    mockGenerateRequirements.mockImplementation((_request, options) =>
      options.onSuccess({ requirements: "- 3+ years of experience" })
    )
    render(<Step5Description />)

    await user.click(screen.getByRole("button", { name: "Generate Requirements" }))

    expect(useJobWizardStore.getState().formData.requirements).toBe("- 3+ years of experience")
    expect(screen.getByRole("button", { name: "Regenerate Requirements" })).toBeInTheDocument()
    expect(screen.getByText(/AI-generated\. Edit the list freely/)).toBeInTheDocument()
  })

  it("keeps Regenerate labels when the step is opened again", () => {
    useJobWizardStore.getState().markAiGenerated("description")
    useJobWizardStore.getState().markAiGenerated("requirements")
    render(<Step5Description />)

    expect(screen.getByRole("button", { name: "Regenerate Description" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Regenerate Requirements" })).toBeInTheDocument()
  })
})
