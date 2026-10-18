import {
  clearMultipartSession,
  readMultipartSession,
  writeMultipartSession,
} from "../utils/multipart-upload-session"

const file = { name: "intro.mp4", size: 12_000_000, lastModified: 1_700_000_000_000 }
const otherFile = { name: "different.mp4", size: 500, lastModified: 1_700_000_001_000 }

describe("multipart-upload-session", () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  it("returns null when no session has been written for this file", () => {
    expect(readMultipartSession(file)).toBeNull()
  })

  it("returns the session that was written for a matching fingerprint", () => {
    writeMultipartSession(file, {
      uploadId: "upload-1",
      storageKey: "videos/user-1/upload-1",
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
    })

    expect(readMultipartSession(file)).toEqual({
      uploadId: "upload-1",
      storageKey: "videos/user-1/upload-1",
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
    })
  })

  it("returns null for a different file, even with a session already stored", () => {
    writeMultipartSession(file, {
      uploadId: "upload-1",
      storageKey: "videos/user-1/upload-1",
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
    })

    expect(readMultipartSession(otherFile)).toBeNull()
  })

  it("returns null after the session is cleared", () => {
    writeMultipartSession(file, {
      uploadId: "upload-1",
      storageKey: "videos/user-1/upload-1",
      fileName: file.name,
      fileSize: file.size,
      fileLastModified: file.lastModified,
    })

    clearMultipartSession(file)

    expect(readMultipartSession(file)).toBeNull()
  })

  it("returns null and does not throw when localStorage.getItem throws", () => {
    const originalGetItem = window.localStorage.getItem
    window.localStorage.getItem = () => {
      throw new Error("localStorage disabled")
    }

    expect(readMultipartSession(file)).toBeNull()

    window.localStorage.getItem = originalGetItem
  })

  it("does not throw when localStorage.setItem throws", () => {
    const originalSetItem = window.localStorage.setItem
    window.localStorage.setItem = () => {
      throw new Error("localStorage disabled")
    }

    expect(() =>
      writeMultipartSession(file, {
        uploadId: "upload-1",
        storageKey: "videos/user-1/upload-1",
        fileName: file.name,
        fileSize: file.size,
        fileLastModified: file.lastModified,
      })
    ).not.toThrow()

    window.localStorage.setItem = originalSetItem
  })
})
