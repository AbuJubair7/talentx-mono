"use client"

import React from "react"
import { ArrowLeft, FileText, FileWarning, Lightbulb, RotateCcw } from "lucide-react"
import { formatBytes } from "../utils/resume-format"
import type { FileMeta } from "../types/upload.types"

interface ExtractionErrorProps {
  file: FileMeta
  errorMessage?: string | null
  onRetry: () => void
  onReset: () => void
}

export function ExtractionError({ file, errorMessage, onRetry, onReset }: ExtractionErrorProps) {
  return (
    <div className="flex flex-col items-center px-2 pt-4 text-center" role="alert">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
        <FileWarning className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">Extraction Unsuccessful</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-600">
        {errorMessage || "The AI service encountered a temporary connection issue while parsing your document."}
      </p>

      <div className="mt-5 inline-flex max-w-full items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-4 shadow-sm">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="truncate text-sm font-medium text-slate-900">{file.name}</span>
        <span className="h-3.5 w-px shrink-0 bg-slate-200" aria-hidden="true" />
        <span className="shrink-0 text-sm tabular-nums text-slate-500">{formatBytes(file.size)}</span>
      </div>

      <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row-reverse">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry extraction
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-[background-color,transform] duration-150 ease-out hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-slate-400/20 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Choose different file
        </button>
      </div>

      <div className="mt-8 w-full border-t border-slate-100 pt-4">
        <p className="flex items-start justify-center gap-2 text-left text-xs leading-relaxed text-slate-500">
          <Lightbulb className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span>
            <span className="font-medium text-slate-600">Tip:</span> Make sure the document contains selectable text and
            is not a scanned photo.
          </span>
        </p>
      </div>
    </div>
  )
}
