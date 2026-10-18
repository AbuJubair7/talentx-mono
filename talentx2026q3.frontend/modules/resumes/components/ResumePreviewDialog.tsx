"use client"

import { useState } from "react"
import { AlertCircleIcon, DownloadIcon, LoaderCircleIcon, XIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { useResumeUrl } from "../hooks/useResumeUrl"
import type { SavedResume } from "../types/resume.types"
import { formatBytes, formatUploadedAt, getFileKind } from "../utils/resume-format"
import { ResumeDefaultBadge } from "./ResumeDefaultBadge"
import { ResumeFileThumbnail } from "./ResumeFileThumbnail"

interface ResumePreviewDialogProps {
  resume: SavedResume | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResumePreviewDialog({ resume, open, onOpenChange }: ResumePreviewDialogProps) {
  const { data, isPending, isError } = useResumeUrl(resume?.id ?? null, open && Boolean(resume))
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)

  // The parent keeps `resume` set while the dialog closes, so the exit animation
  // never flashes empty.
  const shown = resume

  const kind = shown ? (getFileKind(shown.contentType, shown.originalFileName) ?? "PDF") : "PDF"
  const isPdf = kind === "PDF"
  const isLoaded = Boolean(data?.url) && loadedUrl === data?.url

  const downloadLink = (className: string) =>
    shown && data?.url ? (
      <a
        href={data.url}
        download={shown.originalFileName}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Download
      </a>
    ) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl",
          isPdf && "h-[min(88vh,900px)]",
        )}
      >
        {shown ? (
          <>
            <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <DialogTitle className="truncate text-sm font-semibold text-slate-900">
                    {shown.displayName}
                  </DialogTitle>
                  {shown.isDefault ? <ResumeDefaultBadge /> : null}
                </div>
                <DialogDescription className="mt-0.5 truncate text-xs text-slate-500">
                  {kind} · {formatBytes(shown.sizeBytes)}
                  {formatUploadedAt(shown.uploadedAt)
                    ? ` · Uploaded ${formatUploadedAt(shown.uploadedAt)}`
                    : ""}
                </DialogDescription>
              </div>
              {downloadLink(cn(buttonVariants({ variant: "outline", size: "sm" }), "max-sm:hidden"))}
              <DialogClose
                aria-label="Close preview"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </DialogClose>
            </header>

            {isPending ? (
              <div className="flex min-h-64 flex-1 items-center justify-center bg-slate-50">
                <span className="inline-flex items-center gap-2 text-sm text-slate-500" role="status">
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Loading preview…
                </span>
              </div>
            ) : isError || !data ? (
              <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-2 bg-slate-50 px-6 text-center">
                <AlertCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                <p className="text-sm text-slate-600">
                  We couldn&apos;t load this resume. Please try again.
                </p>
              </div>
            ) : isPdf ? (
              <div className="relative flex-1 bg-slate-100">
                {!isLoaded ? (
                  <div className="absolute inset-0 grid place-items-center" role="status">
                    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                      <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Rendering preview…
                    </span>
                  </div>
                ) : null}
                <iframe
                  key={data.url}
                  src={data.url}
                  title={`Preview of ${shown.displayName}`}
                  onLoad={() => setLoadedUrl(data.url)}
                  className="relative h-full w-full"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center bg-slate-50 px-6 py-12 text-center">
                <ResumeFileThumbnail kind="DOCX" size="lg" />
                <p className="mt-6 text-sm font-semibold text-slate-900">
                  Word documents can&apos;t be previewed here
                </p>
                <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                  Download the file to open it in Word, Pages, or Google Docs. Employers receive
                  exactly this file.
                </p>
                <div className="mt-6">
                  {downloadLink(cn(buttonVariants({ variant: "default", size: "default" })))}
                </div>
              </div>
            )}

            {isPdf ? (
              <div className="border-t border-slate-100 p-3 sm:hidden">
                {downloadLink(cn(buttonVariants({ variant: "outline" }), "w-full"))}
              </div>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
