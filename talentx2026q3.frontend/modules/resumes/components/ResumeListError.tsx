"use client"

import { CircleAlertIcon, RotateCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ResumeListErrorProps {
  onRetry: () => void
}

export function ResumeListError({ onRetry }: ResumeListErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center"
    >
      <CircleAlertIcon className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">We couldn&apos;t load your resumes</p>
        <p className="mt-0.5 text-sm text-slate-500">
          Your files are safe. Check your connection and try again.
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RotateCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}
