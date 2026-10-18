import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"
import { employerJobsService } from "@/modules/employer-jobs"

import { CreateJobView } from "../components/CreateJobView"
import { useCurrentEmployer } from "../hooks/useCurrentEmployer"
import { jobsService } from "../services/jobs.service"
import { useJobWizardStore } from "../store/job-wizard-store"

const mockRouterPush = jest.fn()
const mockRouterReplace = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
}))

jest.mock("../services/jobs.service", () => ({
  jobsService: { createJob: jest.fn(), updateJob: jest.fn(), getJob: jest.fn() },
}))

jest.mock("@/modules/employer-jobs", () => ({
  employerJobKeys: { all: ["employer"] },
  employerJobsService: { deleteJob: jest.fn() },
}))

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

jest.mock("../hooks/useCurrentEmployer", () => ({
  useCurrentEmployer: jest.fn(),
}))

const mockedJobsService = jobsService as jest.Mocked<typeof jobsService>
const mockedDeleteJob = jest.mocked(employerJobsService.deleteJob)
const mockedUseCurrentEmployer = jest.mocked(useCurrentEmployer)
const linkClicked = jest.fn()

// The wizard plus a link elsewhere in the app, to trigger the leave warning.
function renderWithLink() {
  return render(
    <>
      <CreateJobView />
      <a
        href="/dashboard"
        onClick={(event) => {
          event.preventDefault()
          linkClicked()
        }}
      >
        Go to dashboard
      </a>
    </>,
    { wrapper: createQueryWrapper() }
  )
}

// Passes Step 1 with Next; the draft it creates gets the id "job-1".
async function completeStepOne(user: ReturnType<typeof userEvent.setup>) {
  mockedJobsService.createJob.mockResolvedValueOnce("job-1")
  await user.click(screen.getByText("Next"))
  await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))
}

let pushStateSpy: jest.SpyInstance
let goSpy: jest.SpyInstance

beforeEach(() => {
  jest.clearAllMocks()
  window.localStorage.clear()
  pushStateSpy = jest.spyOn(window.history, "pushState").mockImplementation(() => {})
  goSpy = jest.spyOn(window.history, "go").mockImplementation(() => {})
  mockedUseCurrentEmployer.mockReturnValue({ data: undefined, isLoading: false } as unknown as ReturnType<
    typeof useCurrentEmployer
  >)
  useJobWizardStore.getState().resetWizard()
  useJobWizardStore.getState().updateFormData({ title: "Backend Engineer", companyName: "Acme" })
})

afterEach(() => {
  pushStateSpy.mockRestore()
  goSpy.mockRestore()
})

// Proves every finished step is saved as a draft quietly, and that leaving asks whether to keep or delete that draft.
describe("CreateJobView draft on every step", () => {
  it("saves a draft quietly when a step is completed and moves on at once", async () => {
    const user = userEvent.setup()
    renderWithLink()

    await completeStepOne(user)

    expect(mockedJobsService.createJob).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Backend Engineer", publish: false })
    )
    expect(toast.success).not.toHaveBeenCalled()
    expect(useJobWizardStore.getState().currentStep).toBe(2)
    expect(await screen.findByText("Draft saved to your account")).toBeInTheDocument()
  })

  it("asks to keep or delete the draft that Next created, even with no new changes", async () => {
    const user = userEvent.setup()
    renderWithLink()
    await completeStepOne(user)

    await user.click(screen.getByText("Go to dashboard"))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Keep this job as a draft?")).toBeInTheDocument()
    expect(within(dialog).queryByText(/aren't saved yet/)).not.toBeInTheDocument()
    expect(linkClicked).not.toHaveBeenCalled()
  })

  it("Keep draft leaves without another save when nothing changed", async () => {
    const user = userEvent.setup()
    renderWithLink()
    await completeStepOne(user)

    await user.click(screen.getByText("Go to dashboard"))
    await user.click(await screen.findByRole("button", { name: "Keep draft" }))

    expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard")
    expect(mockedJobsService.updateJob).not.toHaveBeenCalled()
  })

  it("Keep draft saves the current step's changes first, then leaves", async () => {
    const user = userEvent.setup()
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    renderWithLink()
    await completeStepOne(user)
    act(() => useJobWizardStore.getState().updateFormData({ vacancies: 3 }))

    await user.click(screen.getByText("Go to dashboard"))
    expect(await screen.findByText(/Your changes on Step 2 aren't saved yet/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Keep draft" }))

    await waitFor(() => expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard"))
    expect(mockedJobsService.updateJob).toHaveBeenCalledWith("job-1", expect.objectContaining({ vacancies: 3 }))
  })

  it("Delete draft deletes it, then leaves", async () => {
    const user = userEvent.setup()
    mockedDeleteJob.mockResolvedValueOnce(undefined)
    renderWithLink()
    await completeStepOne(user)

    await user.click(screen.getByText("Go to dashboard"))
    await user.click(await screen.findByRole("button", { name: "Delete draft" }))

    await waitFor(() => expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard"))
    expect(mockedDeleteJob).toHaveBeenCalledWith("job-1")
  })

  it("stays and explains when the draft can't be deleted", async () => {
    const user = userEvent.setup()
    mockedDeleteJob.mockRejectedValueOnce(new Error("Network Error"))
    renderWithLink()
    await completeStepOne(user)

    await user.click(screen.getByText("Go to dashboard"))
    await user.click(await screen.findByRole("button", { name: "Delete draft" }))

    expect(await screen.findByText(/Couldn't delete the draft/)).toBeInTheDocument()
    expect(mockRouterReplace).not.toHaveBeenCalled()
  })

  it("doesn't ask after an explicit Save & exit with no changes since", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-1")
    renderWithLink()
    act(() => useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" }))

    await user.click(screen.getByText("Save & exit"))
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Job saved as draft."))

    await waitFor(async () => {
      linkClicked.mockClear()
      await user.click(screen.getByText("Go to dashboard"))
      expect(linkClicked).toHaveBeenCalledTimes(1)
    })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("Discard deletes the draft and starts again from a blank Step 1", async () => {
    const user = userEvent.setup()
    mockedDeleteJob.mockResolvedValueOnce(undefined)
    renderWithLink()
    await completeStepOne(user)

    await user.click(screen.getByRole("button", { name: "Discard" }))
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText(/The draft saved so far will be deleted/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Discard" }))

    await waitFor(() => expect(mockedDeleteJob).toHaveBeenCalledWith("job-1"))
    await waitFor(() => expect(useJobWizardStore.getState().currentStep).toBe(1))
    expect(useJobWizardStore.getState().formData.title).toBe("")
  })

  it("says so when the step's draft couldn't be saved", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockRejectedValueOnce(new Error("Network Error"))
    renderWithLink()
    // A real employer types before pressing Next; that typing is what the failed save leaves unsaved.
    act(() => useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" }))

    await user.click(screen.getByText("Next"))

    expect(await screen.findByText(/Couldn't save the draft/)).toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })
})
