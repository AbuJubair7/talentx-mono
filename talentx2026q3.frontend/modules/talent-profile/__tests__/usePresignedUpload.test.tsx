import { act, renderHook, waitFor } from "@testing-library/react"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { usePresignedUpload } from "../hooks/usePresignedUpload"
import { talentProfileService } from "../services/talent-profile.service"
import { putWithProgress } from "../utils/storage-put"

jest.mock("../services/talent-profile.service")
jest.mock("../utils/storage-put")

const mockedTalentProfileService = talentProfileService as jest.Mocked<typeof talentProfileService>
const mockedPutWithProgress = putWithProgress as jest.MockedFunction<typeof putWithProgress>

describe("usePresignedUpload", () => {
  beforeEach(() => {
    mockedPutWithProgress.mockImplementation(async (_url, _body, _type, onProgress) => {
      onProgress?.(50)
      onProgress?.(100)
      return { eTag: "mock-etag" }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("requests an upload target, PUTs the file, then confirms and reaches success", async () => {
    mockedTalentProfileService.requestProfilePictureUploadUrl.mockResolvedValueOnce({
      uploadUrl: "https://storage.example/picture",
      storageKey: "profile-pictures/user-1/abc.jpg",
      expiresAt: "2026-01-01T00:00:00Z",
      httpMethod: "PUT",
    })
    mockedTalentProfileService.confirmProfilePictureUpload.mockResolvedValueOnce(undefined)

    const file = new File(["binary"], "photo.jpg", { type: "image/jpeg" })
    const { result } = renderHook(() => usePresignedUpload(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.upload(file)
    })

    await waitFor(() => expect(result.current.status).toBe("success"))
    expect(result.current.progress).toBe(100)
    expect(result.current.error).toBeNull()
    expect(mockedTalentProfileService.requestProfilePictureUploadUrl).toHaveBeenCalledWith("image/jpeg")
    expect(mockedTalentProfileService.confirmProfilePictureUpload).toHaveBeenCalledWith(
      "profile-pictures/user-1/abc.jpg"
    )
  })

  it("does not call confirm when the direct PUT fails", async () => {
    mockedTalentProfileService.requestProfilePictureUploadUrl.mockResolvedValueOnce({
      uploadUrl: "https://storage.example/picture",
      storageKey: "profile-pictures/user-1/abc.jpg",
      expiresAt: "2026-01-01T00:00:00Z",
      httpMethod: "PUT",
    })
    mockedPutWithProgress.mockRejectedValueOnce(new Error("Network error during upload."))

    const file = new File(["binary"], "photo.jpg", { type: "image/jpeg" })
    const { result } = renderHook(() => usePresignedUpload(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.upload(file).catch(() => {})
    })

    await waitFor(() => expect(result.current.status).toBe("error"))
    expect(mockedTalentProfileService.confirmProfilePictureUpload).not.toHaveBeenCalled()
    expect(result.current.error).not.toBeNull()
  })
})
