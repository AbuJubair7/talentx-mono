"use client"

import { Loader2Icon, SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIGenerateButtonProps {
  onClick: () => void
  isLoading: boolean
  label?: string
  className?: string
}

export function AIGenerateButton({
  onClick,
  isLoading,
  label = "Generate with AI",
  className,
}: AIGenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "group relative inline-flex shrink-0 self-start items-center justify-center overflow-hidden rounded-xl p-[1.5px] sm:self-auto text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-150%] animate-border-beam motion-reduce:hidden [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#10b981_310deg,#34d399_340deg,#ffffff_358deg,transparent_360deg)] opacity-60 blur-[2px]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-150%] animate-border-beam motion-reduce:hidden [background:conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#059669_300deg,#34d399_330deg,#a7f3d0_350deg,#ffffff_358deg,transparent_360deg)] opacity-90 group-hover:opacity-100"
      />
      <span className="relative z-10 inline-flex h-full w-full items-center gap-2 whitespace-nowrap rounded-[calc(0.75rem-1.5px)] border border-emerald-200/90 bg-emerald-50 px-4 py-2 text-emerald-700 transition-colors duration-200 group-hover:bg-emerald-100/90 group-hover:border-emerald-300 group-hover:text-emerald-800 group-hover:shadow-sm">
        {isLoading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <SparklesIcon className="h-4 w-4" />
        )}
        {label}
      </span>
    </button>
  )
}

