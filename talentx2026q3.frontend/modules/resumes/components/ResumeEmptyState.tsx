"use client"

import { FileTextIcon } from "lucide-react"

interface ResumeEmptyStateProps {
  max: number
}

export function ResumeEmptyState({ max }: ResumeEmptyStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-slate-400 ring-1 ring-inset ring-slate-200">
        <FileTextIcon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">No resumes yet</p>
        <p className="mt-0.5 text-sm text-slate-500">
          Use <span className="font-medium text-slate-700">Add resume</span> to upload a PDF or DOCX up
          to 5 MB. You can keep up to {max}, and your first one becomes the default.
        </p>
      </div>
    </div>
  )
}
