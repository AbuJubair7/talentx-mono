"use client"

import { useRef, useState } from "react"
import { CheckIcon, UploadIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { formatBytes, getFileKind } from "../utils/resume-format"
import { ResumeFileThumbnail } from "./ResumeFileThumbnail"

interface ResumeUploadOptionProps {
  selected: boolean
  file: File | null
  hasSavedResumes: boolean
  onSelect: () => void
  onFileSelected: (file: File) => void
  onRemoveFile: () => void
}

/** Dashed peer card for the apply form's resume choice list. */
export function ResumeUploadOption({
  selected,
  file,
  hasSavedResumes,
  onSelect,
  onFileSelected,
  onRemoveFile,
}: ResumeUploadOptionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const kind = file ? (getFileKind(file.type, file.name) ?? "PDF") : null
  const title = file?.name ?? (hasSavedResumes ? "Upload a tailored resume" : "Upload a resume")
  const subtitle = file
    ? `${kind} · ${formatBytes(file.size)} · Ready to upload`
    : "PDF or DOCX, up to 5 MB"

  function openPicker() {
    onSelect()
    inputRef.current?.click()
  }

  function selectDroppedFile(files: FileList | null) {
    const dropped = files?.[0]
    if (dropped) onFileSelected(dropped)
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        selectDroppedFile(event.dataTransfer.files)
      }}
      className={cn(
        "flex items-center gap-4 rounded-lg border border-dashed p-3 transition-[border-color,box-shadow,background-color] duration-150",
        dragging || selected
          ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
          : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50",
      )}
    >
      <button
        type="button"
        onClick={openPicker}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        {kind ? (
          <ResumeFileThumbnail kind={kind} className="ml-1.5" />
        ) : (
          <span
            aria-hidden="true"
            className="ml-1.5 flex h-14 w-11 shrink-0 items-center justify-center rounded-[3px] border border-dashed border-slate-300 bg-slate-50 text-slate-400"
          >
            <UploadIcon className="h-4 w-4" />
          </span>
        )}
        <span className="min-w-0">
          <span className={cn("block truncate text-sm font-semibold", file ? "text-slate-900" : "text-slate-700")}>
            {title}
          </span>
          <span className="mt-1 block truncate text-xs text-slate-500">{subtitle}</span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {file ? (
          <button
            type="button"
            onClick={onRemoveFile}
            aria-label={`Remove ${file.name}`}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        ) : null}
        {selected ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
          </span>
        ) : (
          <span className="h-5 w-5 shrink-0" aria-hidden="true" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="sr-only"
        onChange={(event) => {
          const chosen = event.target.files?.[0]
          if (chosen) onFileSelected(chosen)
          event.target.value = ""
        }}
      />
    </div>
  )
}
