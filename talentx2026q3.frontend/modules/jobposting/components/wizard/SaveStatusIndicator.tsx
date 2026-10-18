"use client"

import { Cloud, Laptop, TriangleAlert } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Where the employer's latest changes are kept: this browser, their account (server draft), or nowhere yet.
export type SaveStatus =
  | { kind: "device"; at: string }
  | { kind: "account"; at: string }
  | { kind: "failed" }
  | { kind: "server-error" }
  | null

// Formats a save time as a short clock time, e.g. "10:42 AM".
function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

// Quiet line next to Save & exit saying where the work is kept. Only the words are announced to screen readers;
// the time is hidden from them so each new write isn't read out.
export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  return (
    <p role="status" aria-live="polite" className="flex min-h-5 items-center text-xs text-slate-500">
      {status?.kind === "device" && (
        <Tooltip>
          <TooltipTrigger className="inline-flex cursor-help items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <Laptop className="size-3.5" aria-hidden="true" />
            <span>Saved on this device</span>
            <span aria-hidden="true">· {formatTime(status.at)}</span>
          </TooltipTrigger>
          <TooltipContent>
            Kept in this browser in case your computer shuts down. Next or Save &amp; exit saves it to your account.
          </TooltipContent>
        </Tooltip>
      )}
      {status?.kind === "account" && (
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <Cloud className="size-3.5" aria-hidden="true" />
          <span>Draft saved to your account</span>
          <span aria-hidden="true">· {formatTime(status.at)}</span>
        </span>
      )}
      {status?.kind === "failed" && (
        <span className="inline-flex items-center gap-1.5 text-amber-700">
          <TriangleAlert className="size-3.5" aria-hidden="true" />
          Not backed up on this device. Use Next or Save &amp; exit to keep your work.
        </span>
      )}
      {status?.kind === "server-error" && (
        <span className="inline-flex items-center gap-1.5 text-amber-700">
          <TriangleAlert className="size-3.5" aria-hidden="true" />
          Couldn&apos;t save the draft. Your work is still on this device.
        </span>
      )}
    </p>
  )
}
