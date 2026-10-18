"use client"

import { useState } from "react"
import { FileTextIcon } from "lucide-react"

import type { CurrentResumeCardProps } from "../types"
import { ReplaceResumeDialog } from "./ReplaceResumeDialog"

export function CurrentResumeCard({
  resumeFileName,
  resumeOriginalFileName,
  resumeUrl,
  onReplaceResume,
}: CurrentResumeCardProps) {
  const [isInternalDialogOpen, setIsInternalDialogOpen] = useState(false)
  const resolvedFileName = resumeFileName ?? resumeOriginalFileName ?? null

  function handleButtonClick() {
    if (onReplaceResume) {
      onReplaceResume()
    } else {
      setIsInternalDialogOpen(true)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-6 shadow-xs">
      <h2 className="text-base font-bold text-slate-900">Resume</h2>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {resolvedFileName ? (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <FileTextIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
            <span>{resolvedFileName}</span>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No resume on file yet.</p>
        )}

        <div className="flex items-center gap-2">
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
            >
              View resume
            </a>
          ) : null}
          <button
            type="button"
            onClick={handleButtonClick}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
          >
            {resolvedFileName ? "Replace resume" : "Upload resume"}
          </button>
        </div>
      </div>

      {!onReplaceResume ? (
        <ReplaceResumeDialog open={isInternalDialogOpen} onOpenChange={setIsInternalDialogOpen} />
      ) : null}
    </section>
  )
}
