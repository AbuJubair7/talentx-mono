import { formatShortDate } from "@/lib/date"

import type { SavedResume } from "../types/resume.types"

export type ResumeFileKind = "PDF" | "DOCX"

export function getFileKind(contentType: string, fileName: string): ResumeFileKind | null {
  const lowerName = fileName.toLowerCase()
  if (contentType === "application/pdf" || lowerName.endsWith(".pdf")) return "PDF"
  if (
    contentType.includes("wordprocessingml") ||
    lowerName.endsWith(".docx") ||
    lowerName.endsWith(".doc")
  ) {
    return "DOCX"
  }
  return null
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatUploadedAt(iso: string): string {
  return formatShortDate(iso, "")
}

/** Default first, then newest upload first — mirrors the backend list ordering. */
export function sortResumes(list: SavedResume[]): SavedResume[] {
  return [...list].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1
    return Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt)
  })
}
