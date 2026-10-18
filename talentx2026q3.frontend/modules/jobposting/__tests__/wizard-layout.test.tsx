import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WizardLayout } from "../components/wizard/WizardLayout"
import { useJobWizardStore, WIZARD_STEPS } from "../store/job-wizard-store"

beforeEach(() => {
  useJobWizardStore.getState().resetWizard()
})

function renderWizard(props?: { onSaveDraft?: () => void; onPublish?: () => void }) {
  const onSaveDraft = props?.onSaveDraft ?? jest.fn()
  const onPublish = props?.onPublish ?? jest.fn()
  const validateStep = jest.fn().mockReturnValue([])

  return {
    onSaveDraft,
    onPublish,
    ...render(
      <WizardLayout
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        isSubmitting={false}
        validateStep={validateStep}
      >
        <div>Step content</div>
      </WizardLayout>
    ),
  }
}

describe("WizardLayout", () => {
  it("renders eyebrow label", () => {
    renderWizard()
    expect(screen.getByText("Employer · Job posting")).toBeInTheDocument()
  })

  it("renders step indicator", () => {
    renderWizard()
    WIZARD_STEPS.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument()
    })
  })

  it("renders Save & exit button on the last step", () => {
    useJobWizardStore.getState().setStep(6)
    renderWizard()
    expect(screen.getByText("Save & exit")).toBeInTheDocument()
  })

  it("renders Save & exit button on every non-last step too", () => {
    for (const step of [1, 2, 3, 4, 5] as const) {
      useJobWizardStore.getState().setStep(step)
      const { unmount } = renderWizard()
      expect(screen.getByText("Save & exit")).toBeInTheDocument()
      unmount()
    }
  })

  it("renders Next button on non-last steps", () => {
    renderWizard()
    expect(screen.getByText("Next")).toBeInTheDocument()
  })

  it("renders Publish Job button on last step", () => {
    useJobWizardStore.getState().setStep(6)
    renderWizard()
    expect(screen.getByText("Publish Job")).toBeInTheDocument()
  })

  it("does not render Back button on first step", () => {
    renderWizard()
    expect(screen.queryByText("Back")).not.toBeInTheDocument()
  })

  it("renders Back button on non-first steps", () => {
    useJobWizardStore.getState().setStep(3)
    renderWizard()
    expect(screen.getByText("Back")).toBeInTheDocument()
  })

  it("calls onSaveDraft when Save & exit is clicked", async () => {
    const user = userEvent.setup()
    useJobWizardStore.getState().setStep(6)
    const { onSaveDraft } = renderWizard()

    await user.click(screen.getByText("Save & exit"))
    expect(onSaveDraft).toHaveBeenCalledTimes(1)
  })

  it("calls onSaveDraft when clicked from the very first step", async () => {
    const user = userEvent.setup()
    useJobWizardStore.getState().setStep(1)
    const { onSaveDraft } = renderWizard()

    await user.click(screen.getByText("Save & exit"))
    expect(onSaveDraft).toHaveBeenCalledTimes(1)
  })

  it("calls onPublish when Publish Job is clicked", async () => {
    const user = userEvent.setup()
    useJobWizardStore.getState().setStep(6)
    const { onPublish } = renderWizard()

    await user.click(screen.getByText("Publish Job"))
    expect(onPublish).toHaveBeenCalledTimes(1)
  })

  it("advances to next step when Next is clicked with valid step", async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByText("Next"))
    expect(useJobWizardStore.getState().currentStep).toBe(2)
  })

  it("goes back to previous step when Back is clicked", async () => {
    const user = userEvent.setup()
    useJobWizardStore.getState().setStep(3)
    renderWizard()

    await user.click(screen.getByText("Back"))
    expect(useJobWizardStore.getState().currentStep).toBe(2)
  })

  it("shows validation errors when Next is clicked with invalid step", async () => {
    const user = userEvent.setup()
    const validateStep = jest.fn().mockReturnValue(["title:Title is required"])

    render(
      <WizardLayout
        onSaveDraft={jest.fn()}
        onPublish={jest.fn()}
        isSubmitting={false}
        validateStep={validateStep}
      >
        <div>Step content</div>
      </WizardLayout>
    )

    await user.click(screen.getByText("Next"))
    expect(useJobWizardStore.getState().fieldErrors.title).toBe("Title is required")
  })

  it("renders children content", () => {
    renderWizard()
    expect(screen.getByText("Step content")).toBeInTheDocument()
  })
})

// Proves the view is told about a finished step (to save the draft) only when Next really moves on.
describe("WizardLayout onStepComplete", () => {
  function renderWithValidation(errors: string[]) {
    const onStepComplete = jest.fn()
    render(
      <WizardLayout
        onSaveDraft={jest.fn()}
        onPublish={jest.fn()}
        onStepComplete={onStepComplete}
        isSubmitting={false}
        validateStep={jest.fn().mockReturnValue(errors)}
      >
        <div>Step content</div>
      </WizardLayout>
    )
    return onStepComplete
  }

  it("is called once the step is valid and the wizard has moved on", async () => {
    const onStepComplete = renderWithValidation([])

    await userEvent.click(screen.getByText("Next"))

    expect(onStepComplete).toHaveBeenCalledTimes(1)
    expect(useJobWizardStore.getState().currentStep).toBe(2)
  })

  it("is not called when the step has errors", async () => {
    const onStepComplete = renderWithValidation(["title:Title must not be empty"])

    await userEvent.click(screen.getByText("Next"))

    expect(onStepComplete).not.toHaveBeenCalled()
    expect(useJobWizardStore.getState().currentStep).toBe(1)
  })
})
