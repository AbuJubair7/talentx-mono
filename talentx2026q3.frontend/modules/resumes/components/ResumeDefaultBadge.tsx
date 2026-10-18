"use client"

import { CheckIcon } from "lucide-react"

export function ResumeDefaultBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <CheckIcon className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
      Default
    </span>
  )
}
