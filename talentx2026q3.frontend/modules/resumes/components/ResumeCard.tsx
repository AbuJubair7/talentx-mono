"use client"

import { motion, useReducedMotion } from "framer-motion"
import { EyeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { SavedResume } from "../types/resume.types"
import { formatBytes, formatUploadedAt, getFileKind } from "../utils/resume-format"
import { ResumeActionsMenu } from "./ResumeActionsMenu"
import { ResumeDefaultBadge } from "./ResumeDefaultBadge"
import { ResumeFileThumbnail } from "./ResumeFileThumbnail"

export type ResumeBusyState = "saving" | "deleting"

interface ResumeCardProps {
  resume: SavedResume
  busy?: ResumeBusyState
  onPreview: (resume: SavedResume) => void
  onRename: (resume: SavedResume) => void
  onSetDefault: (resume: SavedResume) => void
  onDelete: (resume: SavedResume) => void
}

/** Horizontal document card in the resume library list. */
export function ResumeCard({
  resume,
  busy,
  onPreview,
  onRename,
  onSetDefault,
  onDelete,
}: ResumeCardProps) {
  const reduceMotion = useReducedMotion()
  const kind = getFileKind(resume.contentType, resume.originalFileName) ?? "PDF"
  const isBusy = Boolean(busy)
  const uploadedAt = formatUploadedAt(resume.uploadedAt)

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      aria-busy={isBusy || undefined}
      className={cn(
        "group relative flex items-center gap-4 rounded-lg border p-3 transition-[border-color,box-shadow,background-color] duration-150",
        resume.isDefault
          ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
          : "border-slate-200 bg-white hover:border-slate-300",
        !isBusy && "hover:shadow-[0_2px_10px_-3px_rgba(15,23,42,0.1)]",
      )}
    >
      <ResumeFileThumbnail kind={kind} busy={isBusy} className="ml-1.5" />

      <div
        className={cn(
          "min-w-0 flex-1 transition-opacity duration-150",
          busy === "deleting" && "opacity-50",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-slate-900" title={resume.displayName}>
            {resume.displayName}
          </h3>
          {resume.isDefault ? <ResumeDefaultBadge /> : null}
        </div>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          <span className="shrink-0">{kind}</span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0 tabular-nums">{formatBytes(resume.sizeBytes)}</span>
          {uploadedAt ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">
                Uploaded <time dateTime={resume.uploadedAt}>{uploadedAt}</time>
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {busy ? (
          <span className="whitespace-nowrap text-xs font-medium text-slate-500 max-sm:sr-only">
            {busy === "deleting" ? "Deleting…" : "Saving…"}
          </span>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPreview(resume)}
          disabled={isBusy}
          aria-label={`Preview ${resume.displayName}`}
          className="hidden sm:inline-flex"
        >
          <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Preview
        </Button>
        <ResumeActionsMenu
          resume={resume}
          disabled={isBusy}
          includePreviewOnMobile
          onPreview={() => onPreview(resume)}
          onRename={() => onRename(resume)}
          onSetDefault={() => onSetDefault(resume)}
          onDelete={() => onDelete(resume)}
        />
      </div>
    </motion.li>
  )
}
