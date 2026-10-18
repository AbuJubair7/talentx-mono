import { renderHook, waitFor, act } from "@testing-library/react"
import { toast } from "sonner"
import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"
import { useExtractResume } from "../hooks/useExtractResume"
import { talentProfileService } from "../services/talent-profile.service"
import type { ApiError } from "@/lib/api/axios"

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock("../services/talent-profile.service", () => ({
  talentProfileService: {
    extractResume: jest.fn(),
  },
}))

const mockedExtractResume = talentProfileService.extractResume as jest.MockedFunction<
  typeof talentProfileService.extractResume
>
const mockedToastError = toast.error as jest.MockedFunction<typeof toast.error>

describe("useExtractResume", () => {
  const dummyFile = new File(["dummy content"], "resume.pdf", { type: "application/pdf" })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("handles successful resume extraction", async () => {
    const mockResult = {
      resumeUploadId: "upload-1",
      fileStorageKey: "key-1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      portfolioUrls: [],
      workExperience: [],
      education: [],
      technicalSkills: ["React"],
      softSkills: [],
      toolsAndPlatforms: [],
    }

    mockedExtractResume.mockResolvedValueOnce(mockResult)

    const { result } = renderHook(() => useExtractResume(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.mutate(dummyFile)
    })

    await waitFor(() => expect(mockedExtractResume).toHaveBeenCalledTimes(1))
    expect(result.current.isSuccess).toBe(true)
  })

  it("shows non-retryable error toast on 400 Bad Request", async () => {
    const error: ApiError = {
      status: 400,
      message: "File must be PDF or DOCX and under 5 MB.",
    }
    mockedExtractResume.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useExtractResume(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.mutate(dummyFile)
    })

    await waitFor(() => expect(mockedToastError).toHaveBeenCalled())
    expect(mockedToastError).toHaveBeenCalledWith(
      "Invalid File",
      expect.objectContaining({
        description: "File must be PDF or DOCX and under 5 MB.",
      })
    )

    const toastOptions = mockedToastError.mock.calls[0][1] as { action?: { label: string } }
    expect(toastOptions?.action).toBeUndefined()
  })

  it("shows non-retryable error toast on 422 Unprocessable Entity", async () => {
    const error: ApiError = {
      status: 422,
      message: "No extractable text found",
    }
    mockedExtractResume.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useExtractResume(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.mutate(dummyFile)
    })

    await waitFor(() => expect(mockedToastError).toHaveBeenCalled())
    expect(mockedToastError).toHaveBeenCalledWith(
      "Unprocessable resume",
      expect.objectContaining({
        description: "No extractable text found. Please upload a standard text-based PDF/DOCX.",
      })
    )

    const toastOptions = mockedToastError.mock.calls[0][1] as { action?: { label: string } }
    expect(toastOptions?.action).toBeUndefined()
  })

  it("shows retry button on 502 Bad Gateway and retries with the same file when clicked", async () => {
    const error: ApiError = {
      status: 502,
      message: "AI extraction service is temporarily unavailable.",
    }
    mockedExtractResume.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useExtractResume(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.mutate(dummyFile)
    })

    await waitFor(() => expect(mockedToastError).toHaveBeenCalled())
    expect(mockedToastError).toHaveBeenCalledWith(
      "Service temporarily unavailable",
      expect.objectContaining({
        description: "AI extraction service encountered a temporary error. Please try again.",
        action: expect.objectContaining({
          label: "Retry",
        }),
      })
    )

    const toastOptions = mockedToastError.mock.calls[0][1] as {
      action: { label: string; onClick: () => void }
    }
    expect(toastOptions.action).toBeDefined()
    expect(toastOptions.action.label).toBe("Retry")

    mockedExtractResume.mockResolvedValueOnce({
      resumeUploadId: "upload-2",
      fileStorageKey: "key-2",
      fullName: "Jane Doe",
      email: "jane@example.com",
      portfolioUrls: [],
      workExperience: [],
      education: [],
      technicalSkills: [],
      softSkills: [],
      toolsAndPlatforms: [],
    })

    await act(async () => {
      toastOptions.action.onClick()
    })

    await waitFor(() => expect(mockedExtractResume).toHaveBeenCalledTimes(2))
    expect(mockedExtractResume).toHaveBeenLastCalledWith(dummyFile)
  })
})
