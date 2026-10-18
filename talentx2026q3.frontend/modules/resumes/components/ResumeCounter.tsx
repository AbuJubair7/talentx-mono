"use client"

import { cn } from "@/lib/utils"

interface ResumeCounterProps {
  status: "loading" | "error" | "ready"
  used: number
  max: number
}

export function ResumeCounter({ status, used, max }: ResumeCounterProps) {
  if (status === "loading") {
    return <span aria-hidden="true" className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
  }
  if (status === "error") return null

  const isFull = used >= max

  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-full px-2 text-xs font-medium tabular-nums ring-1 ring-inset",
        isFull ? "bg-slate-900 text-white ring-slate-900" : "bg-slate-50 text-slate-600 ring-slate-200",
      )}
    >
      {used} of {max} saved
    </span>
  )
}
