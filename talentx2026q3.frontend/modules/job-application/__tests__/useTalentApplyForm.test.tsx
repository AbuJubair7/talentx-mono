import { act, renderHook } from "@testing-library/react"

import { useSaveResume } from "@/modules/resumes"

import { jobApplicationService } from "../services/job-application.service"
import { useTalentApplyForm } from "../hooks/useTalentApplyForm"
import type { ApplicationPrefill } from "../types/job-application.types"

jest.mock("@/modules/resumes", () => ({
  useSaveResume: jest.fn(),
}))
jest.mock("../services/job-application.service", () => ({
  jobApplicationService: {
    uploadApplicationResume: jest.fn(),
  },
}))
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockedUseSaveResume = useSaveResume as jest.MockedFunction<typeof useSaveResume>
const mockedService = jobApplicationService as jest.Mocked<typeof jobApplicationService>

const prefill: ApplicationPrefill = {
  name: "Jane Talent",
  email: "jane@example.com",
  phone: null,
  location: "Dhaka",
  expectedSalary: 90000,
  totalYearsExperience: 5,
  resumeStorageKey: "resumes/default.pdf",
  resumeOriginalFileName: "default.pdf",
  resumeUrl: "https://signed.example.com/default.pdf",
  resumes: [
    {
      id: "resume-1",
      displayName: "Default Resume",
      originalFileName: "default.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: true,
      uploadedAt: "2026-09-01T12:00:00Z",
    },
    {
      id: "resume-2",
      displayName: "Design Resume",
      originalFileName: "design.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-09-02T12:00:00Z",
    },
  ],
}

const file = new File(["resume"], "cv.pdf", { type: "application/pdf" })

describe("useTalentApplyForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseSaveResume.mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn().mockResolvedValue({ id: "resume-9" }),
    } as unknown as ReturnType<typeof useSaveResume>)
  })

  it("submits the default saved resume by id", async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => useTalentApplyForm(prefill, onSubmit, false))

    await act(async () => {
      await result.current.handleSubmitForm()
    })

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ resumeId: "resume-1", resumeStorageKey: "" }),
    )
  })

  it("saves a new upload to the library and applies with its id", async () => {
    const onSubmit = jest.fn()
    const { result } = renderHook(() => useTalentApplyForm(prefill, onSubmit, false))
    const mutateAsync = mockedUseSaveResume.mock.results[0].value.mutateAsync

    act(() => {
      result.current.form.setValue("resumeOption", "new")
      result.current.form.setValue("resumeFile", file)
      result.current.form.setValue("saveToLibrary", true)
    })

    await act(async () => {
      await result.current.handleSubmitForm()
    })

    expect(mutateAsync).toHaveBeenCalledWith({ file })
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ resumeId: "resume-9", resumeStorageKey: "" }),
    )
    expect(mockedService.uploadApplicationResume).not.toHaveBeenCalled()
  })

  it("uploads a new resume without saving it when the option is off", async () => {
    const onSubmit = jest.fn()
    mockedService.uploadApplicationResume.mockResolvedValueOnce({
      storageKey: "resumes/user-1/cv.pdf",
      originalFileName: "cv.pdf",
    })
    const { result } = renderHook(() => useTalentApplyForm(prefill, onSubmit, false))

    act(() => {
      result.current.form.setValue("resumeOption", "new")
      result.current.form.setValue("resumeFile", file)
    })

    await act(async () => {
      await result.current.handleSubmitForm()
    })

    expect(mockedService.uploadApplicationResume).toHaveBeenCalledWith(file)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ resumeId: undefined, resumeStorageKey: "resumes/user-1/cv.pdf" }),
    )
  })

  it("defaults to uploading when the talent has no saved resumes", () => {
    const { result } = renderHook(() =>
      useTalentApplyForm({ ...prefill, resumes: [] }, jest.fn(), false),
    )

    expect(result.current.resumeOption).toBe("new")
  })
})
