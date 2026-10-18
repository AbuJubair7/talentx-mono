import { act, renderHook, waitFor } from "@testing-library/react"

import { createQueryWrapper } from "@/tests/test-utils/query-client-wrapper"

import { useMultipartUpload } from "../hooks/useMultipartUpload"
import { talentProfileService } from "../services/talent-profile.service"
import { readMultipartSession, writeMultipartSession } from "../utils/multipart-upload-session"
import { putWithProgress } from "../utils/storage-put"

jest.mock("../services/talent-profile.service")
jest.mock("../utils/storage-put")

const mockedTalentProfileService = talentProfileService as jest.Mocked<typeof talentProfileService>
const mockedPutWithProgress = putWithProgress as jest.MockedFunction<typeof putWithProgress>

function makeVideoFile(sizeBytes: number, name = "intro.mp4", lastModified = 1_700_000_000_000): File {
  const file = new File([new Uint8Array(sizeBytes)], name, { type: "video/mp4" })
  Object.defineProperty(file, "lastModified", { value: lastModified })
  return file
}

describe("useMultipartUpload", () => {
  beforeEach(() => {
    mockedPutWithProgress.mockImplementation(async (_url, _body, _type, onProgress) => {
      onProgress?.(100)
      return { eTag: "etag-value" }
    })
    window.localStorage.clear()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("initiates a fresh session and uploads every part for a new file", async () => {
    mockedTalentProfileService.initiateVideoMultipartUpload.mockResolvedValueOnce({
      uploadId: "upload-1",
      storageKey: "videos/user-1/upload-1",
      partSizeBytes: 5 * 1024 * 1024,
    })
    mockedTalentProfileService.requestVideoPartUploadUrl.mockResolvedValue("https://storage.example/part")
    mockedTalentProfileService.completeVideoMultipartUpload.mockResolvedValueOnce(undefined)

    const file = makeVideoFile(6 * 1024 * 1024) // 2 parts at 5 MB each
    const { result } = renderHook(() => useMultipartUpload(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.upload(file)
    })

    await waitFor(() => expect(result.current.status).toBe("success"))
    expect(mockedTalentProfileService.requestVideoPartUploadUrl).toHaveBeenCalledTimes(2)
    expect(mockedTalentProfileService.completeVideoMultipartUpload).toHaveBeenCalledWith(
      "videos/user-1/upload-1",
      "upload-1",
      [
        { partNumber: 1, eTag: "etag-value" },
        { partNumber: 2, eTag: "etag-value" },
      ]
    )
    expect(readMultipartSession(file)).toBeNull()
  })

  it("resumes from an existing session, uploading only the missing parts", async () => {
    const file = makeVideoFile(11 * 1024 * 1024) // 3 parts

    writeMultipartSession(file, {
      uploadId: "resumed-upload",
      storageKey: "videos/user-1/resumed-upload",
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
    })

    mockedTalentProfileService.listVideoMultipartParts.mockResolvedValueOnce([
      { partNumber: 1, eTag: "already-uploaded", sizeBytes: 5 * 1024 * 1024 },
    ])
    mockedTalentProfileService.requestVideoPartUploadUrl.mockResolvedValue("https://storage.example/part")
    mockedTalentProfileService.completeVideoMultipartUpload.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useMultipartUpload(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.upload(file)
    })

    await waitFor(() => expect(result.current.status).toBe("success"))
    expect(mockedTalentProfileService.initiateVideoMultipartUpload).not.toHaveBeenCalled()
    // Only parts 2 and 3 needed a fresh upload URL — part 1 was already uploaded.
    expect(mockedTalentProfileService.requestVideoPartUploadUrl).toHaveBeenCalledTimes(2)
    expect(mockedTalentProfileService.completeVideoMultipartUpload).toHaveBeenCalledWith(
      "videos/user-1/resumed-upload",
      "resumed-upload",
      [
        { partNumber: 1, eTag: "already-uploaded" },
        { partNumber: 2, eTag: "etag-value" },
        { partNumber: 3, eTag: "etag-value" },
      ]
    )
  })

  it("starts a fresh session at 0% when a different file is selected", async () => {
    const previousFile = makeVideoFile(6 * 1024 * 1024, "old.mp4", 1_700_000_000_000)
    writeMultipartSession(previousFile, {
      uploadId: "old-upload",
      storageKey: "videos/user-1/old-upload",
      fileName: previousFile.name,
      fileSize: previousFile.size,
      fileLastModified: previousFile.lastModified,
    })

    const newFile = makeVideoFile(6 * 1024 * 1024, "new.mp4", 1_700_000_002_000)

    mockedTalentProfileService.initiateVideoMultipartUpload.mockResolvedValueOnce({
      uploadId: "new-upload",
      storageKey: "videos/user-1/new-upload",
      partSizeBytes: 5 * 1024 * 1024,
    })
    mockedTalentProfileService.requestVideoPartUploadUrl.mockResolvedValue("https://storage.example/part")
    mockedTalentProfileService.completeVideoMultipartUpload.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useMultipartUpload(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.upload(newFile)
    })

    await waitFor(() => expect(result.current.status).toBe("success"))
    expect(mockedTalentProfileService.listVideoMultipartParts).not.toHaveBeenCalled()
    expect(mockedTalentProfileService.initiateVideoMultipartUpload).toHaveBeenCalledTimes(1)
  })

  it("clears the stale session on a 404 (session genuinely gone), so a retry starts fresh", async () => {
    const file = makeVideoFile(6 * 1024 * 1024)

    writeMultipartSession(file, {
      uploadId: "expired-upload",
      storageKey: "videos/user-1/expired-upload",
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
    })

    mockedTalentProfileService.listVideoMultipartParts.mockRejectedValueOnce({
      status: 404,
      message: "Upload session not found.",
    })

    const { result } = renderHook(() => useMultipartUpload(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.upload(file).catch(() => {})
    })

    await waitFor(() => expect(result.current.status).toBe("error"))
    expect(readMultipartSession(file)).toBeNull()

    mockedTalentProfileService.initiateVideoMultipartUpload.mockResolvedValueOnce({
      uploadId: "fresh-upload",
      storageKey: "videos/user-1/fresh-upload",
      partSizeBytes: 5 * 1024 * 1024,
    })
    mockedTalentProfileService.requestVideoPartUploadUrl.mockResolvedValue("https://storage.example/part")
    mockedTalentProfileService.completeVideoMultipartUpload.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.upload(file)
    })

    await waitFor(() => expect(result.current.status).toBe("success"))
    // The retry started a brand new session instead of hitting the same
    // broken resume path again.
    expect(mockedTalentProfileService.initiateVideoMultipartUpload).toHaveBeenCalledTimes(1)
    expect(mockedTalentProfileService.listVideoMultipartParts).toHaveBeenCalledTimes(1)
  })

  it("preserves the session on a transient (network/5xx) resume failure, so a retry still resumes", async () => {
    const file = makeVideoFile(11 * 1024 * 1024) // 3 parts

    writeMultipartSession(file, {
      uploadId: "resumed-upload",
      storageKey: "videos/user-1/resumed-upload",
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
    })

    // First attempt: a network blip (status: null, as produced by the shared
    // ApiError parser for a failed-to-reach-server case) must NOT clear the
    // session.
    mockedTalentProfileService.listVideoMultipartParts.mockRejectedValueOnce({
      status: null,
      message: "Unable to reach the server. Please check your connection.",
    })

    const { result } = renderHook(() => useMultipartUpload(), { wrapper: createQueryWrapper() })

    await act(async () => {
      await result.current.upload(file).catch(() => {})
    })

    await waitFor(() => expect(result.current.status).toBe("error"))
    expect(readMultipartSession(file)).not.toBeNull()

    // A 500 must not clear it either.
    mockedTalentProfileService.listVideoMultipartParts.mockRejectedValueOnce({
      status: 500,
      message: "Internal server error.",
    })

    await act(async () => {
      await result.current.upload(file).catch(() => {})
    })

    await waitFor(() => expect(result.current.status).toBe("error"))
    expect(readMultipartSession(file)).not.toBeNull()

    // Retrying again succeeds by resuming the still-intact session — it
    // never had to re-initiate a brand new one.
    mockedTalentProfileService.listVideoMultipartParts.mockResolvedValueOnce([
      { partNumber: 1, eTag: "already-uploaded", sizeBytes: 5 * 1024 * 1024 },
    ])
    mockedTalentProfileService.requestVideoPartUploadUrl.mockResolvedValue("https://storage.example/part")
    mockedTalentProfileService.completeVideoMultipartUpload.mockResolvedValueOnce(undefined)

    await act(async () => {
      await result.current.upload(file)
    })

    await waitFor(() => expect(result.current.status).toBe("success"))
    expect(mockedTalentProfileService.initiateVideoMultipartUpload).not.toHaveBeenCalled()
  })

  it("aborts the active session and clears its saved state on cancel", async () => {
    mockedTalentProfileService.initiateVideoMultipartUpload.mockResolvedValueOnce({
      uploadId: "upload-1",
      storageKey: "videos/user-1/upload-1",
      partSizeBytes: 5 * 1024 * 1024,
    })
    mockedTalentProfileService.abortVideoMultipartUpload.mockResolvedValueOnce(undefined)

    let releasePartUpload: (() => void) | undefined
    mockedTalentProfileService.requestVideoPartUploadUrl.mockImplementation(
      () =>
        new Promise((resolve) => {
          releasePartUpload = () => resolve("https://storage.example/part")
        })
    )

    const file = makeVideoFile(6 * 1024 * 1024)
    const { result } = renderHook(() => useMultipartUpload(), { wrapper: createQueryWrapper() })

    let uploadPromise: Promise<void> | undefined
    act(() => {
      uploadPromise = result.current.upload(file)
    })

    await waitFor(() => expect(mockedTalentProfileService.requestVideoPartUploadUrl).toHaveBeenCalled())

    await act(async () => {
      await result.current.cancel()
      releasePartUpload?.()
      await uploadPromise?.catch(() => {})
    })

    await waitFor(() => expect(result.current.status).toBe("cancelled"))
    expect(mockedTalentProfileService.abortVideoMultipartUpload).toHaveBeenCalledWith(
      "videos/user-1/upload-1",
      "upload-1"
    )
    expect(mockedTalentProfileService.completeVideoMultipartUpload).not.toHaveBeenCalled()
    expect(readMultipartSession(file)).toBeNull()
  })
})
