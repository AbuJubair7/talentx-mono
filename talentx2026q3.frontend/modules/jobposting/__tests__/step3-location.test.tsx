import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Step3Location } from "../components/wizard/Step3Location"
import { useJobWizardStore } from "../store/job-wizard-store"

beforeEach(() => {
  useJobWizardStore.getState().resetWizard()
})

describe("Step3Location", () => {
  it("renders work arrangement and location fields", () => {
    render(<Step3Location />)

    expect(screen.getByText("Location & Work Arrangement")).toBeInTheDocument()
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument()
  })

  it("renders work arrangement toggle buttons", () => {
    render(<Step3Location />)

    expect(screen.getByRole("radio", { name: /On-site/i })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Hybrid/i })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Full Remote/i })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Remote.*Accessible/i })).toBeInTheDocument()
  })

  it("shows city and country fields for all arrangements", () => {
    render(<Step3Location />)

    expect(screen.getByLabelText(/City/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Country/)).toBeInTheDocument()
  })

  it("marks city as required for OnSite", () => {
    render(<Step3Location />)

    const cityLabel = screen.getByText("City")
    expect(cityLabel).toBeInTheDocument()
  })

  it("marks country as required for OnSite", () => {
    render(<Step3Location />)

    const countryLabel = screen.getByText("Country")
    expect(countryLabel).toBeInTheDocument()
  })

  it("shows optional hint for FullRemote", async () => {
    const user = userEvent.setup()
    render(<Step3Location />)

    const fullRemoteBtn = screen.getByRole("radio", { name: /Full Remote/i })
    await user.click(fullRemoteBtn)

    expect(screen.getByText("Optional for this work arrangement")).toBeInTheDocument()
  })

  it("shows minOverlapHours for FullRemote", async () => {
    const user = userEvent.setup()
    render(<Step3Location />)

    const fullRemoteBtn = screen.getByRole("radio", { name: /Full Remote/i })
    await user.click(fullRemoteBtn)

    expect(screen.getByLabelText(/Minimum Overlap Hours/)).toBeInTheDocument()
  })

  it("hides minOverlapHours for OnSite", () => {
    render(<Step3Location />)

    expect(screen.queryByLabelText(/Minimum Overlap Hours/)).not.toBeInTheDocument()
  })

  it("updates workArrangement in store on toggle", async () => {
    const user = userEvent.setup()
    render(<Step3Location />)

    const hybridBtn = screen.getByRole("radio", { name: /Hybrid/i })
    await user.click(hybridBtn)

    expect(useJobWizardStore.getState().formData.workArrangement).toBe("Hybrid")
  })

  it("updates location in store on input", async () => {
    const user = userEvent.setup()
    render(<Step3Location />)

    const locationInput = screen.getByLabelText(/Location/)
    await user.type(locationInput, "Dhaka, Bangladesh")

    expect(useJobWizardStore.getState().formData.location).toBe("Dhaka, Bangladesh")
  })

  it("updates city in store on input", async () => {
    const user = userEvent.setup()
    render(<Step3Location />)

    const cityInput = screen.getByLabelText(/City/)
    await user.type(cityInput, "Dhaka")

    expect(useJobWizardStore.getState().formData.city).toBe("Dhaka")
  })

  it("updates country in store on input", async () => {
    const user = userEvent.setup()
    render(<Step3Location />)

    const countryInput = screen.getByLabelText(/Country/)
    await user.type(countryInput, "Bangladesh")

    expect(useJobWizardStore.getState().formData.country).toBe("Bangladesh")
  })

  it("displays field errors from store", () => {
    useJobWizardStore.getState().setFieldErrors({ location: "Location is required" })
    render(<Step3Location />)

    expect(screen.getByText("Location is required")).toBeInTheDocument()
  })
})
