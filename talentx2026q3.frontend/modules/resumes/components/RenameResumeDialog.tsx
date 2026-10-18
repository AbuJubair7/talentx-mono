"use client"

import { useState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import type { SavedResume } from "../types/resume.types"

const MAX_LENGTH = 100

interface RenameResumeDialogProps {
  open: boolean
  resume: SavedResume | null
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSave: (displayName: string) => void
}

export function RenameResumeDialog({
  open,
  resume,
  isSaving,
  onOpenChange,
  onSave,
}: RenameResumeDialogProps) {
  // The parent remounts this dialog with a `key` per resume, so the initial
  // value is always the resume being renamed without a syncing effect.
  const [value, setValue] = useState(resume?.displayName ?? "")
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSaving) return
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = value.trim()

    if (!trimmed) {
      setError("Give this resume a name.")
      return
    }
    if (trimmed === resume?.displayName) {
      onOpenChange(false)
      return
    }

    onSave(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename resume</DialogTitle>
          <DialogDescription>
            Only you see this name. Employers receive{" "}
            <span className="break-all">{resume?.originalFileName}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="resume-display-name" className="text-sm font-medium text-slate-700">
            Display name
          </label>
          <input
            id="resume-display-name"
            value={value}
            maxLength={MAX_LENGTH}
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => {
              setValue(event.target.value)
              if (error) setError(null)
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby="resume-name-hint"
            className={cn(
              "mt-1.5 h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 shadow-xs transition-[border-color] duration-150 placeholder:text-slate-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1",
              error ? "border-red-300" : "border-slate-200 hover:border-slate-300",
            )}
          />
          <div id="resume-name-hint" className="mt-1.5 flex justify-between text-xs">
            {error ? (
              <span role="alert" className="text-red-600">
                {error}
              </span>
            ) : (
              <span className="text-slate-400">e.g. &quot;Backend Engineer Resume&quot;</span>
            )}
            <span className="tabular-nums text-slate-400">
              {value.length}/{MAX_LENGTH}
            </span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-slate-900 text-white hover:bg-slate-800">
              {isSaving ? (
                <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              Save name
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
