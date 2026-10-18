"use client"

import { SparklesIcon } from "lucide-react"

interface AIGeneratedNoteProps {
  children: React.ReactNode
}

// Small note under an AI-filled field saying it can be edited or regenerated.
export function AIGeneratedNote({ children }: AIGeneratedNoteProps) {
  return (
    <p className="mt-1 flex items-start gap-1.5 text-xs text-emerald-700">
      <SparklesIcon aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
