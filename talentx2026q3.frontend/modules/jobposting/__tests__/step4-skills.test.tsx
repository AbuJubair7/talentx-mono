import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Step4Skills } from "../components/wizard/Step4Skills"
import { useJobWizardStore } from "../store/job-wizard-store"

const mockGenerateSkills = jest.fn()

jest.mock("../hooks/useGenerateSkills", () => ({
  useGenerateSkills: () => ({
    mutate: (...args: unknown[]) => mockGenerateSkills(...args),
    isPending: false,
  }),
}))

beforeEach(() => {
  mockGenerateSkills.mockReset()
  useJobWizardStore.getState().resetWizard()
})

describe("Step4Skills", () => {
  it("renders skills heading", () => {
    render(<Step4Skills />)
    expect(screen.getByText("Required Skills")).toBeInTheDocument()
  })

  it("renders AI generate button", () => {
    render(<Step4Skills />)
    expect(screen.getByText("Generate Skills")).toBeInTheDocument()
  })

  it("hints that skills can be generated and edited", () => {
    render(<Step4Skills />)
    expect(screen.getByText(/Use Generate Skills for AI suggestions — you can edit them/)).toBeInTheDocument()
    expect(screen.queryByText(/AI-generated\./)).not.toBeInTheDocument()
  })

  it("switches to Regenerate and shows the AI note after a successful generation", async () => {
    const user = userEvent.setup()
    mockGenerateSkills.mockImplementation((_request, options) =>
      options.onSuccess({ skills: ["React", "TypeScript"] })
    )
    render(<Step4Skills />)

    await user.click(screen.getByRole("button", { name: "Generate Skills" }))

    expect(useJobWizardStore.getState().formData.requiredSkills).toEqual(["React", "TypeScript"])
    expect(screen.getByRole("button", { name: "Regenerate Skills" })).toBeInTheDocument()
    expect(screen.getByText(/AI-generated\. Add or remove skills freely/)).toBeInTheDocument()
  })

  it("keeps the Regenerate label when the step is opened again", () => {
    useJobWizardStore.getState().markAiGenerated("skills")
    render(<Step4Skills />)
    expect(screen.getByRole("button", { name: "Regenerate Skills" })).toBeInTheDocument()
  })

  it("renders skill input field", () => {
    render(<Step4Skills />)
    expect(screen.getByPlaceholderText("Type a skill…")).toBeInTheDocument()
  })

  it("adds a skill on Enter key", async () => {
    const user = userEvent.setup()
    render(<Step4Skills />)

    const input = screen.getByPlaceholderText("Type a skill…")
    await user.type(input, "React{enter}")

    expect(useJobWizardStore.getState().formData.requiredSkills).toContain("React")
  })

  it("does not add duplicate skills", async () => {
    const user = userEvent.setup()
    render(<Step4Skills />)

    const input = screen.getByPlaceholderText("Type a skill…")
    await user.type(input, "React{enter}")
    await user.type(input, "React{enter}")

    expect(useJobWizardStore.getState().formData.requiredSkills).toHaveLength(1)
  })

  it("removes a skill on Backspace when input is empty", async () => {
    const user = userEvent.setup()
    useJobWizardStore.getState().updateFormData({ requiredSkills: ["React", "Vue"] })
    render(<Step4Skills />)

    const input = screen.getByPlaceholderText("Type a skill…")
    await user.type(input, "{backspace}")

    const skills = useJobWizardStore.getState().formData.requiredSkills
    expect(skills).toHaveLength(1)
    expect(skills).not.toContain("Vue")
  })

  it("displays field errors from store", () => {
    useJobWizardStore.getState().setFieldErrors({ requiredSkills: "Add at least one skill" })
    render(<Step4Skills />)

    expect(screen.getByText("Add at least one skill")).toBeInTheDocument()
  })
})
