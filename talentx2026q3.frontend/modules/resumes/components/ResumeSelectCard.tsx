"use client"

import { CheckIcon, EyeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { SavedResume } from "../types/resume.types"
import { formatBytes, formatUploadedAt, getFileKind } from "../utils/resume-format"
import { ResumeDefaultBadge } from "./ResumeDefaultBadge"
import { ResumeFileThumbnail } from "./ResumeFileThumbnail"

interface ResumeSelectCardProps {
  resume: SavedResume
  selected: boolean
  onSelect: (resume: SavedResume) => void
  onPreview: (resume: SavedResume) => void
}

/** Selectable document card used by the apply form, matching the profile ResumeCard look. */
export function ResumeSelectCard({ resume, selected, onSelect, onPreview }: ResumeSelectCardProps) {
  const kind = getFileKind(resume.contentType, resume.originalFileName) ?? "PDF"
  const uploadedAt = formatUploadedAt(resume.uploadedAt)

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-3 transition-[border-color,box-shadow,background-color] duration-150",
        selected
          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_2px_10px_-3px_rgba(15,23,42,0.1)]",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(resume)}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        <ResumeFileThumbnail kind={kind} className="ml-1.5" />
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-sm font-semibold text-slate-900" title={resume.displayName}>
              {resume.displayName}
            </span>
            {resume.isDefault ? <ResumeDefaultBadge /> : null}
          </span>
          <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
            <span className="shrink-0">{kind}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0 tabular-nums">{formatBytes(resume.sizeBytes)}</span>
            {uploadedAt ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="min-w-0 truncate">
                  Uploaded <time dateTime={resume.uploadedAt}>{uploadedAt}</time>
                </span>
              </>
            ) : null}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPreview(resume)}
          aria-label={`Preview ${resume.displayName}`}
        >
          <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Preview
        </Button>
        {selected ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
          </span>
        ) : (
          <span className="h-5 w-5 shrink-0" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
