import { act, renderHook } from "@testing-library/react"
import { toast } from "sonner"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"
import { employerJobsService } from "@/modules/employer-jobs"

import { useDraftSaver } from "../hooks/useDraftSaver"
import { jobsService } from "../services/jobs.service"
import type { CreateJobPayload } from "../types/job.types"

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

const mockedJobsService = jobsService as jest.Mocked<typeof jobsService>
const mockedDeleteJob = jest.mocked(employerJobsService.deleteJob)

const PAYLOAD = { title: "Senior React Developer", publish: false } as CreateJobPayload

// A promise the test resolves by hand, to hold a request "in flight".
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function renderSaver() {
  return renderHook(() => useDraftSaver(), { wrapper: createQueryWrapper() })
}

beforeEach(() => jest.clearAllMocks())

// Proves the wizard keeps exactly one server draft per session, in order, and only toasts for visible actions.
describe("useDraftSaver", () => {
  it("creates the draft once, then updates the same job", async () => {
    mockedJobsService.createJob.mockResolvedValueOnce("job-1")
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    const { result } = renderSaver()

    await act(() => result.current.saveDraft({ payload: PAYLOAD, silent: true }))
    await act(() => result.current.saveDraft({ payload: PAYLOAD, silent: true }))

    expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1)
    expect(mockedJobsService.updateJob).toHaveBeenCalledWith("job-1", PAYLOAD)
    expect(result.current.draftJobId).toBe("job-1")
  })

  it("creates only one draft when two saves start at the same time (two quick Next clicks)", async () => {
    const create = deferred<string>()
    mockedJobsService.createJob.mockReturnValueOnce(create.promise)
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    const { result } = renderSaver()

    let first!: Promise<boolean>
    let second!: Promise<boolean>
    act(() => {
      first = result.current.saveDraft({ payload: PAYLOAD, silent: true })
      second = result.current.saveDraft({ payload: PAYLOAD, silent: true })
    })
    await act(async () => {
      create.resolve("job-1")
      await Promise.all([first, second])
    })

    expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1)
    expect(mockedJobsService.updateJob).toHaveBeenCalledWith("job-1", PAYLOAD)
  })

  it("publishes the draft an in-flight save is creating, instead of a second job", async () => {
    const create = deferred<string>()
    mockedJobsService.createJob.mockReturnValueOnce(create.promise)
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    const { result } = renderSaver()
    const publishPayload = { ...PAYLOAD, publish: true }

    let save!: Promise<boolean>
    let published!: Promise<boolean>
    act(() => {
      save = result.current.saveDraft({ payload: PAYLOAD, silent: true })
      published = result.current.publish(publishPayload)
    })
    await act(async () => {
      create.resolve("job-1")
      await Promise.all([save, published])
    })

    expect(mockedJobsService.createJob).toHaveBeenCalledTimes(1)
    expect(mockedJobsService.updateJob).toHaveBeenCalledWith("job-1", publishPayload)
    expect(toast.success).toHaveBeenCalledWith("Job published.")
  })

  it("saves silently for Next, but toasts and marks the draft as kept for Save & exit", async () => {
    mockedJobsService.createJob.mockResolvedValueOnce("job-1")
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    const { result } = renderSaver()

    await act(() => result.current.saveDraft({ payload: PAYLOAD, silent: true }))
    expect(toast.success).not.toHaveBeenCalled()
    expect(result.current.keptOnPurpose).toBe(false)
    expect(result.current.serverSavedAt).not.toBeNull()

    await act(() => result.current.saveDraft({ payload: PAYLOAD, silent: false }))
    expect(toast.success).toHaveBeenCalledWith("Job saved as draft.")
    expect(result.current.keptOnPurpose).toBe(true)
  })

  it("reports a failed save without a toast when silent, and with one when visible", async () => {
    mockedJobsService.createJob.mockRejectedValue(new Error("Network Error"))
    const { result } = renderSaver()

    let saved = true
    await act(async () => {
      saved = await result.current.saveDraft({ payload: PAYLOAD, silent: true })
    })
    expect(saved).toBe(false)
    expect(result.current.saveError).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()

    await act(() => result.current.saveDraft({ payload: PAYLOAD, silent: false }))
    expect(toast.error).toHaveBeenCalledWith("Network Error", expect.anything())
  })

  it("deletes the draft and forgets it", async () => {
    mockedJobsService.createJob.mockResolvedValueOnce("job-1")
    mockedDeleteJob.mockResolvedValueOnce(undefined)
    const { result } = renderSaver()
    await act(() => result.current.saveDraft({ payload: PAYLOAD, silent: true }))

    let deleted = false
    await act(async () => {
      deleted = await result.current.deleteDraft()
    })

    expect(deleted).toBe(true)
    expect(mockedDeleteJob).toHaveBeenCalledWith("job-1")
    expect(result.current.draftJobId).toBeNull()
    expect(result.current.serverSavedAt).toBeNull()
  })

  it("has nothing to delete before a draft exists", async () => {
    const { result } = renderSaver()

    let deleted = false
    await act(async () => {
      deleted = await result.current.deleteDraft()
    })

    expect(deleted).toBe(true)
    expect(mockedDeleteJob).not.toHaveBeenCalled()
  })

  it("continues a draft recovered from the local backup", async () => {
    mockedJobsService.updateJob.mockResolvedValueOnce(undefined)
    const { result } = renderSaver()

    act(() => result.current.adoptDraft("job-42", true))
    await act(() => result.current.saveDraft({ payload: PAYLOAD, silent: true }))

    expect(result.current.keptOnPurpose).toBe(true)
    expect(mockedJobsService.updateJob).toHaveBeenCalledWith("job-42", PAYLOAD)
    expect(mockedJobsService.createJob).not.toHaveBeenCalled()
  })
})
