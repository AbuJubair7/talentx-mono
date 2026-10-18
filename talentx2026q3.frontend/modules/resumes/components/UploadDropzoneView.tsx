"use client"

import React, { useRef, useState } from "react"
import { AlertCircle, CloudUpload } from "lucide-react"

interface UploadDropzoneViewProps {
  onFileSelected: (file: File) => void
  validationError: string | null
}

export function UploadDropzoneView({ onFileSelected, validationError }: UploadDropzoneViewProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div>
      <label
        htmlFor="resume-file"
        onDragEnter={(e) => {
          e.preventDefault()
          dragDepth.current += 1
          setIsDragging(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault()
          dragDepth.current -= 1
          if (dragDepth.current <= 0) setIsDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          dragDepth.current = 0
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center transition-colors duration-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/70"
            : validationError
            ? "border-rose-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40"
            : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/40"
        }`}
      >
        <input
          ref={inputRef}
          id="resume-file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border bg-white shadow-sm transition-[transform,border-color,color] duration-200 ease-out ${
            isDragging
              ? "-translate-y-1 border-emerald-200 text-emerald-600"
              : "border-slate-200 text-slate-500 group-hover:-translate-y-0.5 group-hover:border-emerald-200 group-hover:text-emerald-600"
          }`}
        >
          <CloudUpload className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <p className="mt-5 text-[15px] font-medium text-slate-900">
          {isDragging ? (
            "Drop to upload your resume"
          ) : (
            <>
              Drag & drop your resume here, or{" "}
              <span className="text-emerald-600 underline-offset-4 group-hover:underline">browse</span>
            </>
          )}
        </p>
        <p className="mt-1.5 text-sm text-slate-500">
          Supports PDF or DOCX up to 5 MB <span aria-hidden="true">•</span> Text-searchable documents recommended
        </p>
      </label>

      {validationError && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {validationError}
        </p>
      )}
    </div>
  )
}
