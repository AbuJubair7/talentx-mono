import { render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { CreateJobView } from "../components/CreateJobView"
import { useJobWizardStore } from "../store/job-wizard-store"
import { jobsService } from "../services/jobs.service"

const mockRouterPush = jest.fn()
const mockRouterReplace = jest.fn()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
}))

jest.mock("../services/jobs.service", () => ({
  jobsService: {
    createJob: jest.fn(),
    updateJob: jest.fn(),
    getJob: jest.fn(),
  },
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock("../hooks/useCurrentEmployer", () => ({
  useCurrentEmployer: jest.fn(),
}))

import { useCurrentEmployer } from "../hooks/useCurrentEmployer"
import type { CurrentEmployerDto } from "../types/me.types"

const mockedJobsService = jobsService as jest.Mocked<typeof jobsService>
const mockedUseCurrentEmployer = jest.mocked(useCurrentEmployer)

function currentEmployerResult(
  data: CurrentEmployerDto | undefined,
  isLoading = false
): ReturnType<typeof useCurrentEmployer> {
  return { data, isLoading } as unknown as ReturnType<typeof useCurrentEmployer>
}

function renderCreateJobView() {
  return render(<CreateJobView />, { wrapper: createQueryWrapper() })
}

describe("CreateJobView — Save & exit from any step", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseCurrentEmployer.mockReturnValue(currentEmployerResult(undefined))
    useJobWizardStore.getState().resetWizard()
    useJobWizardStore.getState().updateFormData({ title: "Backend Engineer", companyName: "Acme" })
  })

  it("creates the draft from step 1, then goes to the jobs list", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")

    renderCreateJobView()

    await user.click(screen.getByText("Save & exit"))

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/job/job-listing"))
    expect(mockedJobsService.createJob).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Backend Engineer", publish: false })
    )
    expect(mockedJobsService.updateJob).not.toHaveBeenCalled()
  })

  it("updates the draft Next created when the current step has changes, instead of creating a second job", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    renderCreateJobView()

    await user.click(screen.getByText("Next"))
    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))
    await act(async () => {
      useJobWizardStore.getState().updateFormData({ vacancies: 3 })
    })
    await user.click(screen.getByText("Save & exit"))

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/job/job-listing"))
    expect(mockedJobsService.updateJob).toHaveBeenCalledWith(
      "job-123",
      expect.objectContaining({ publish: false, vacancies: 3 })
    )
    expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1)
  })

  it("leaves without another request right after a Next, when nothing is left to save", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")
    renderCreateJobView()

    await user.click(screen.getByText("Next"))
    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))
    await screen.findByText("Draft saved to your account")
    await user.click(screen.getByText("Save & exit"))

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/job/job-listing"))
    expect(mockedJobsService.updateJob).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith("Job saved as draft.")
  })

  it("stays on the page when the save fails", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockRejectedValueOnce(new Error("Network Error"))
    renderCreateJobView()

    await user.click(screen.getByText("Save & exit"))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it("publishes directly (no prior draft) by creating a job with publish: true and navigates to the job listing", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-456")

    useJobWizardStore.getState().setStep(6)
    renderCreateJobView()

    await user.click(screen.getByText("Publish Job"))

    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))
    expect(mockedJobsService.createJob).toHaveBeenCalledWith(
      expect.objectContaining({ publish: true })
    )
    expect(mockedJobsService.updateJob).not.toHaveBeenCalled()
    expect(mockRouterPush).toHaveBeenCalledWith("/job/job-listing")
  })

  it("publishes an existing draft via update, instead of creating a duplicate job", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-789")
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)

    renderCreateJobView()

    // Next creates the draft that Publish then publishes.
    await user.click(screen.getByText("Next"))
    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))

    await act(async () => {
      useJobWizardStore.getState().setStep(6)
    })
    await screen.findByText("Publish Job")
    await user.click(screen.getByText("Publish Job"))

    await waitFor(() => expect(mockedJobsService.updateJob).toHaveBeenCalledTimes(1))
    expect(mockedJobsService.updateJob).toHaveBeenCalledWith(
      "job-789",
      expect.objectContaining({ publish: true })
    )
    // no second job ever created
    expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1)
    expect(mockRouterPush).toHaveBeenCalledWith("/job/job-listing")
  })

  it("sends a placeholder future expireAt when saving a draft before a deadline has been chosen", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")

    renderCreateJobView()

    await user.click(screen.getByText("Save & exit"))

    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))
    const payload = mockedJobsService.createJob.mock.calls[0][0]
    expect(payload.expireAt).not.toBe("")
    expect(new Date(payload.expireAt).getTime()).toBeGreaterThan(Date.now())
  })

  it("resets the wizard to a blank step 1 when the employer leaves the page and comes back", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")

    const { unmount } = renderCreateJobView()

    await user.click(screen.getByText("Save & exit"))
    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))

    await act(async () => {
      useJobWizardStore.getState().setStep(3)
    })
    expect(useJobWizardStore.getState().currentStep).toBe(3)

    unmount()

    expect(useJobWizardStore.getState().formData.title).toBe("")
    expect(useJobWizardStore.getState().currentStep).toBe(1)
  })
})

describe("CreateJobView — unsaved changes guard", () => {
  const linkClicked = jest.fn()

  function pageWithLink() {
    return (
      <>
        <CreateJobView />
        <a
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault()
            linkClicked()
          }}
        >
          Go to dashboard
        </a>
      </>
    )
  }

  function renderWithLink() {
    return render(pageWithLink(), { wrapper: createQueryWrapper() })
  }

  let pushStateSpy: jest.SpyInstance
  let goSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseCurrentEmployer.mockReturnValue(currentEmployerResult(undefined))
    pushStateSpy = jest.spyOn(window.history, "pushState").mockImplementation(() => {})
    goSpy = jest.spyOn(window.history, "go").mockImplementation(() => {})
    useJobWizardStore.getState().resetWizard()
    useJobWizardStore.getState().updateFormData({ title: "Backend Engineer" })
  })

  afterEach(() => {
    pushStateSpy.mockRestore()
    goSpy.mockRestore()
  })

  it("lets the employer leave without a prompt when nothing changed since the page opened", async () => {
    const user = userEvent.setup()
    renderWithLink()

    await user.click(screen.getByText("Go to dashboard"))

    expect(linkClicked).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Leave without saving?")).not.toBeInTheDocument()
  })

  it("asks before leaving with unsaved edits, and Stay keeps the form", async () => {
    const user = userEvent.setup()
    renderWithLink()

    await act(async () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" })
    })
    await user.click(screen.getByText("Go to dashboard"))

    expect(await screen.findByText("Leave without saving?")).toBeInTheDocument()
    expect(linkClicked).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Stay" }))

    await waitFor(() =>
      expect(screen.queryByText("Leave without saving?")).not.toBeInTheDocument()
    )
    expect(mockRouterPush).not.toHaveBeenCalled()
    expect(useJobWizardStore.getState().formData.title).toBe("Backend Engineer II")
  })

  it("navigates to the clicked link when the employer chooses Leave anyway", async () => {
    const user = userEvent.setup()
    renderWithLink()

    await act(async () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" })
    })
    await user.click(screen.getByText("Go to dashboard"))
    await user.click(await screen.findByRole("button", { name: "Leave anyway" }))

    expect(mockRouterReplace).toHaveBeenCalledWith("/dashboard")
  })

  it("does not prompt after a successful draft save with no further edits, but asks to keep the draft after a new edit", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockResolvedValueOnce("job-123")
    renderWithLink()

    await act(async () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" })
    })
    await user.click(screen.getByText("Save & exit"))
    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))

    await waitFor(async () => {
      linkClicked.mockClear()
      await user.click(screen.getByText("Go to dashboard"))
      expect(linkClicked).toHaveBeenCalledTimes(1)
    })
    expect(screen.queryByText("Leave without saving?")).not.toBeInTheDocument()

    await act(async () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer III" })
    })
    await user.click(screen.getByText("Go to dashboard"))

    // A draft exists now, so the question is whether to keep it with the new changes.
    expect(await screen.findByText("Keep this job as a draft?")).toBeInTheDocument()
  })

  it("still prompts when the draft save fails", async () => {
    const user = userEvent.setup()
    mockedJobsService.createJob.mockRejectedValueOnce(new Error("network"))
    renderWithLink()

    await act(async () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" })
    })
    await user.click(screen.getByText("Save & exit"))
    await waitFor(() => expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1))

    await user.click(screen.getByText("Go to dashboard"))

    expect(await screen.findByText("Leave without saving?")).toBeInTheDocument()
  })

  it("does not prompt when only the read-only company name auto-fills from the employer's profile", async () => {
    const user = userEvent.setup()
    mockedUseCurrentEmployer.mockReturnValue(currentEmployerResult(undefined, true))
    const { rerender } = renderWithLink()

    // The profile finishes loading after this component already took its snapshot —
    // the exact timing that used to falsely mark the form dirty.
    mockedUseCurrentEmployer.mockReturnValue(
      currentEmployerResult({ id: "employer-1", companyName: "Acme Corp", verificationStatus: "Verified" })
    )
    await act(async () => {
      rerender(pageWithLink())
    })

    await waitFor(() =>
      expect(useJobWizardStore.getState().formData.companyName).toBe("Acme Corp")
    )

    await user.click(screen.getByText("Go to dashboard"))

    expect(linkClicked).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Leave without saving?")).not.toBeInTheDocument()
  })

  it("still prompts for a real edit made while the company name is auto-filling", async () => {
    const user = userEvent.setup()
    mockedUseCurrentEmployer.mockReturnValue(currentEmployerResult(undefined, true))
    const { rerender } = renderWithLink()

    await act(async () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" })
    })

    mockedUseCurrentEmployer.mockReturnValue(
      currentEmployerResult({ id: "employer-1", companyName: "Acme Corp", verificationStatus: "Verified" })
    )
    await act(async () => {
      rerender(pageWithLink())
    })

    await waitFor(() =>
      expect(useJobWizardStore.getState().formData.companyName).toBe("Acme Corp")
    )

    await user.click(screen.getByText("Go to dashboard"))

    expect(await screen.findByText("Leave without saving?")).toBeInTheDocument()
  })

  it("asks before leaving via the browser Back button, and Leave anyway goes back past the trap entry", async () => {
    const user = userEvent.setup()
    renderWithLink()

    await act(async () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer II" })
    })
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: {} }))
    })

    expect(await screen.findByText("Leave without saving?")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Leave anyway" }))

    expect(goSpy).toHaveBeenCalledWith(-2)
  })
})
