import type { FileFingerprint, MultipartUploadSession } from "../../types/media-upload.types"

const STORAGE_KEY_PREFIX = "talentx:videoIntroMultipart:"

export function createFingerprintForFile(file: FileFingerprint): string {
  return `${file.name}-${file.size}-${file.lastModified}`
}

export function readMultipartSession(file: FileFingerprint): MultipartUploadSession | null {
  try {
    const rawSessionString = window.localStorage.getItem(STORAGE_KEY_PREFIX + createFingerprintForFile(file))
    if (!rawSessionString) return null

    const session = JSON.parse(rawSessionString) as MultipartUploadSession
    const matchesSelectedFile =
      session.fileName === file.name && session.fileSize === file.size && session.fileLastModified === file.lastModified

    return matchesSelectedFile ? session : null
  } catch {
    return null
  }
}

export function writeMultipartSession(file: FileFingerprint, session: MultipartUploadSession): void {
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + createFingerprintForFile(file), JSON.stringify(session))
  } catch {
    // Storage access may be restricted in private browsing mode
  }
}

export function clearMultipartSession(file: FileFingerprint): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY_PREFIX + createFingerprintForFile(file))
  } catch {
    // Ignore storage cleanup failures
  }
}
