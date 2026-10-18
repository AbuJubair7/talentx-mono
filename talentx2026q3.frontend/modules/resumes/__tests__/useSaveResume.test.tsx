import { renderHook, waitFor } from "@testing-library/react"
import { toast } from "sonner"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { useSaveResume } from "../hooks/useSaveResume"
import { resumeLibraryService } from "../services/resume.service"
import type { SavedResume } from "../types/resume.types"

jest.mock("../services/resume.service")
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockedResumeLibraryService = resumeLibraryService as jest.Mocked<typeof resumeLibraryService>

describe("useSaveResume", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("displays success toast when updateProfile is false", async () => {
    const savedResumeMock: SavedResume = {
      id: "resume-1",
      displayName: "Backend Resume",
      originalFileName: "backend.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-10-12T00:00:00Z",
    }

    mockedResumeLibraryService.saveResume.mockResolvedValueOnce(savedResumeMock)

    const { result } = renderHook(() => useSaveResume(), {
      wrapper: createQueryWrapper(),
    })

    const file = new File(["binary"], "backend.pdf", { type: "application/pdf" })
    await result.current.mutateAsync({ file, updateProfile: false })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Resume saved.", {
        description: "You can reuse it when applying to jobs.",
      })
    })
  })

  it("does not display toast from hook when updateProfile is true", async () => {
    const savedResumeMock: SavedResume = {
      id: "resume-1",
      displayName: "Backend Resume",
      originalFileName: "backend.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      isDefault: false,
      uploadedAt: "2026-10-12T00:00:00Z",
    }

    mockedResumeLibraryService.saveResume.mockResolvedValueOnce(savedResumeMock)

    const { result } = renderHook(() => useSaveResume(), {
      wrapper: createQueryWrapper(),
    })

    const file = new File(["binary"], "backend.pdf", { type: "application/pdf" })
    await result.current.mutateAsync({ file, updateProfile: true })

    await waitFor(() => {
      expect(toast.success).not.toHaveBeenCalled()
    })
  })
})
