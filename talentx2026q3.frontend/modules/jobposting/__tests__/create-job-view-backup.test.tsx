import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { CreateJobView } from "../components/CreateJobView"
import { useCurrentEmployer } from "../hooks/useCurrentEmployer"
import { jobsService } from "../services/jobs.service"
import { useJobWizardStore, type WizardStep } from "../store/job-wizard-store"
import { readWizardBackup, writeWizardBackup } from "../utils/wizard-backup"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock("../services/jobs.service", () => ({
  jobsService: { createJob: jest.fn(), updateJob: jest.fn(), getJob: jest.fn() },
}))

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

jest.mock("../hooks/useCurrentEmployer", () => ({
  useCurrentEmployer: jest.fn(),
}))

const mockedJobsService = jobsService as jest.Mocked<typeof jobsService>
const mockedUseCurrentEmployer = jest.mocked(useCurrentEmployer)

// Stores an unsaved job for employer "emp-1", as an earlier session of the wizard would have.
function storeBackup(
  overrides: { currentStep?: WizardStep; draftJobId?: string | null; employerId?: string; keptOnPurpose?: boolean } = {}
) {
  writeWizardBackup({
    employerId: overrides.employerId ?? "emp-1",
    savedAt: "2026-10-08T10:42:00.000Z",
    formData: { ...useJobWizardStore.getState().formData, title: "Senior React Developer", companyName: "Acme" },
    currentStep: overrides.currentStep ?? 3,
    completedSteps: [1, 2],
    aiGenerated: { skills: true, description: false, requirements: false },
    draftJobId: overrides.draftJobId ?? null,
    keptOnPurpose: overrides.keptOnPurpose ?? false,
  })
}

// Types into the wizard the way a step component does.
function typeTitle(title: string) {
  act(() => useJobWizardStore.getState().updateFormData({ title }))
}

function renderCreateJobView() {
  return render(<CreateJobView />, { wrapper: createQueryWrapper() })
}

beforeEach(() => {
  jest.clearAllMocks()
  window.localStorage.clear()
  window.history.pushState({}, "", "/job/jobpost")
  useJobWizardStore.getState().resetWizard()
  mockedUseCurrentEmployer.mockReturnValue({
    data: { id: "emp-1", companyName: "Acme", verificationStatus: "Verified" },
    isLoading: false,
  } as unknown as ReturnType<typeof useCurrentEmployer>)
})

afterEach(() => window.history.pushState({}, "", "/"))

// Proves unsaved wizard work is copied to the browser, comes back after a crash, and is dropped once it is safe or
// thrown away on purpose.
describe("CreateJobView local backup", () => {
  it("writes the backup shortly after a change, not on every keystroke", async () => {
    renderCreateJobView()

    typeTitle("Senior React Developer")
    expect(readWizardBackup("emp-1")).toBeNull()

    await waitFor(() => expect(readWizardBackup("emp-1")?.formData.title).toBe("Senior React Developer"))
    expect(readWizardBackup("emp-1")?.currentStep).toBe(1)
  })

  it("writes nothing while the form has no changes", async () => {
    renderCreateJobView()

    await act(() => new Promise((resolve) => setTimeout(resolve, 700)))

    expect(readWizardBackup("emp-1")).toBeNull()
  })

  it("writes at once when the tab is hidden", () => {
    renderCreateJobView()
    typeTitle("Senior React Developer")

    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true })
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"))
    })
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true })

    expect(readWizardBackup("emp-1")?.formData.title).toBe("Senior React Developer")
  })

  it("restores the backup when opened from the popup with ?resume=1", async () => {
    storeBackup()
    window.history.pushState({}, "", "/job/jobpost?resume=1")

    renderCreateJobView()

    await waitFor(() => expect(useJobWizardStore.getState().formData.title).toBe("Senior React Developer"))
    expect(useJobWizardStore.getState().currentStep).toBe(3)
    expect(useJobWizardStore.getState().aiGenerated.skills).toBe(true)
    // The restored work is still unsaved, so the backup stays.
    expect(readWizardBackup("emp-1")).not.toBeNull()
  })

  it("keeps updating the server draft the backup came from, instead of creating a second job", async () => {
    const user = userEvent.setup()
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    storeBackup({ currentStep: 6, draftJobId: "job-42" })
    window.history.pushState({}, "", "/job/jobpost?resume=1")

    renderCreateJobView()
    await user.click(await screen.findByText("Publish Job"))

    await waitFor(() =>
      expect(mockedJobsService.updateJob).toHaveBeenCalledWith(
        "job-42",
        expect.objectContaining({ publish: true })
      )
    )
    expect(mockedJobsService.createJob).not.toHaveBeenCalled()
    expect(readWizardBackup("emp-1")).toBeNull()
  })

  it("offers the backup in a banner when the wizard is opened directly, and Resume restores it", async () => {
    const user = userEvent.setup()
    storeBackup()

    renderCreateJobView()

    const banner = await screen.findByRole("status", { name: "Unsaved job post" })
    expect(banner).toHaveTextContent("Senior React Developer")
    expect(useJobWizardStore.getState().formData.title).toBe("")

    await user.click(within(banner).getByRole("button", { name: "Resume" }))

    expect(useJobWizardStore.getState().formData.title).toBe("Senior React Developer")
    expect(screen.queryByRole("status", { name: "Unsaved job post" })).not.toBeInTheDocument()
  })

  it("removes the backup from the banner's Discard only after confirming", async () => {
    const user = userEvent.setup()
    storeBackup()

    renderCreateJobView()
    const banner = await screen.findByRole("status", { name: "Unsaved job post" })
    await user.click(within(banner).getByRole("button", { name: "Discard" }))

    // One click only asks; nothing is removed yet.
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText(/"Senior React Developer" will be removed from this device/)).toBeInTheDocument()
    expect(readWizardBackup("emp-1")).not.toBeNull()

    await user.click(within(dialog).getByRole("button", { name: "Discard" }))

    await waitFor(() => expect(readWizardBackup("emp-1")).toBeNull())
    expect(screen.queryByRole("status", { name: "Unsaved job post" })).not.toBeInTheDocument()
  })

  it("keeps the backup when the banner's Discard is cancelled", async () => {
    const user = userEvent.setup()
    storeBackup()

    renderCreateJobView()
    const banner = await screen.findByRole("status", { name: "Unsaved job post" })
    await user.click(within(banner).getByRole("button", { name: "Discard" }))
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Keep editing" }))

    expect(readWizardBackup("emp-1")).not.toBeNull()
    expect(screen.getByRole("status", { name: "Unsaved job post" })).toBeInTheDocument()
  })

  it("ignores another employer's backup", async () => {
    storeBackup({ employerId: "emp-2" })

    renderCreateJobView()

    await act(async () => undefined)
    expect(screen.queryByRole("status", { name: "Unsaved job post" })).not.toBeInTheDocument()
  })

  it("throws the job away after confirming Discard", async () => {
    const user = userEvent.setup()
    renderCreateJobView()
    typeTitle("Senior React Developer")
    await waitFor(() => expect(readWizardBackup("emp-1")).not.toBeNull())

    await user.click(screen.getByRole("button", { name: "Discard" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Discard" }))

    expect(readWizardBackup("emp-1")).toBeNull()
    expect(useJobWizardStore.getState().formData.title).toBe("")
    expect(useJobWizardStore.getState().currentStep).toBe(1)
  })

  it("keeps the job when Discard is cancelled", async () => {
    const user = userEvent.setup()
    renderCreateJobView()
    typeTitle("Senior React Developer")
    await waitFor(() => expect(readWizardBackup("emp-1")).not.toBeNull())

    await user.click(screen.getByRole("button", { name: "Discard" }))
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Keep editing" }))

    expect(readWizardBackup("emp-1")).not.toBeNull()
    expect(useJobWizardStore.getState().formData.title).toBe("Senior React Developer")
  })

  it("says nothing before the first change, then that the work is saved on this device", async () => {
    renderCreateJobView()
    expect(screen.queryByText("Saved on this device")).not.toBeInTheDocument()

    typeTitle("Senior React Developer")

    expect(await screen.findByText("Saved on this device")).toBeInTheDocument()
  })

  it("says the draft is saved to the account after Save & exit", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")
    renderCreateJobView()
    typeTitle("Senior React Developer")
    await screen.findByText("Saved on this device")

    await user.click(screen.getByText("Save & exit"))

    expect(await screen.findByText("Draft saved to your account")).toBeInTheDocument()
    expect(screen.queryByText("Saved on this device")).not.toBeInTheDocument()
  })

  it("warns when the browser refuses the backup", async () => {
    const setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })
    renderCreateJobView()

    typeTitle("Senior React Developer")

    expect(await screen.findByText(/Not backed up on this device/)).toBeInTheDocument()
    setItem.mockRestore()
  })

  it("drops the backup once Save & exit has stored the work on the server", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")
    renderCreateJobView()
    typeTitle("Senior React Developer")
    await waitFor(() => expect(readWizardBackup("emp-1")).not.toBeNull())

    await user.click(screen.getByText("Save & exit"))

    await waitFor(() => expect(readWizardBackup("emp-1")).toBeNull())
  })
})
