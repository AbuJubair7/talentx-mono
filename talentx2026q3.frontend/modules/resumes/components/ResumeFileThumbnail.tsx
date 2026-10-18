"use client"

import { LoaderCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ResumeFileKind } from "../utils/resume-format"

interface ResumeFileThumbnailProps {
  kind: ResumeFileKind
  size?: "sm" | "lg"
  busy?: boolean
  className?: string
}

const sizeConfig = {
  sm: {
    box: "h-14 w-11",
    fold: 10,
    body: "gap-[3px] px-[7px] pt-[9px]",
    lines: ["100%", "82%", "94%", "58%"],
    chip: "-left-1.5 bottom-1.5 px-1 py-[3px] text-[8px]",
  },
  lg: {
    box: "h-24 w-[76px]",
    fold: 16,
    body: "gap-[5px] px-3 pt-4",
    lines: ["100%", "88%", "95%", "70%", "100%", "84%", "52%"],
    chip: "-left-2.5 bottom-3 px-1.5 py-1 text-[10px]",
  },
} as const

export function ResumeFileThumbnail({
  kind,
  size = "sm",
  busy = false,
  className,
}: ResumeFileThumbnailProps) {
  const config = sizeConfig[size]

  return (
    <div
      aria-hidden="true"
      className={cn("relative shrink-0 drop-shadow-[0_1px_1.5px_rgba(15,23,42,0.12)]", config.box, className)}
    >
      <div
        className="absolute inset-0 rounded-[3px] bg-white ring-1 ring-inset ring-slate-200"
        style={{ clipPath: `polygon(0 0, calc(100% - ${config.fold}px) 0, 100% ${config.fold}px, 100% 100%, 0 100%)` }}
      >
        <div className={cn("flex flex-col", config.body)}>
          <span className="h-[3px] w-3/5 rounded-full bg-slate-300" />
          {config.lines.map((width, index) => (
            <span key={index} className="h-[2px] rounded-full bg-slate-200" style={{ width }} />
          ))}
        </div>
      </div>
      <div
        className="absolute right-0 top-0 rounded-bl-[2px] bg-slate-200"
        style={{ width: config.fold, height: config.fold, clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
      />
      <span
        className={cn(
          "absolute rounded-[3px] font-bold leading-none tracking-wide",
          config.chip,
          kind === "PDF" ? "bg-slate-800 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300",
        )}
      >
        {kind}
      </span>
      {busy ? (
        <div className="absolute inset-0 grid place-items-center rounded-[3px] bg-white/75">
          <LoaderCircleIcon className="h-4 w-4 animate-spin text-slate-500" />
        </div>
      ) : null}
    </div>
  )
}
