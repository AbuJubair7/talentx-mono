"use client"

import { LoaderCircleIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { SavedResume } from "../types/resume.types"

interface DeleteResumeDialogProps {
  open: boolean
  resume: SavedResume | null
  nextDefault: SavedResume | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteResumeDialog({
  open,
  resume,
  nextDefault,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteResumeDialogProps) {
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isDeleting) return
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        {resume ? (
          <>
            <DialogHeader>
              <div className="flex gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                  <Trash2Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <DialogTitle>Delete &quot;{resume.displayName}&quot;?</DialogTitle>
                  <DialogDescription className="mt-2">
                    This removes{" "}
                    <span className="break-all font-medium text-slate-900">
                      {resume.originalFileName}
                    </span>{" "}
                    from your profile. Employers keep access for jobs you have already applied to;
                    the file is deleted when those jobs are removed.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {resume.isDefault ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {nextDefault ? (
                  <>
                    <span className="font-medium text-slate-900">{nextDefault.displayName}</span>{" "}
                    will become your default resume.
                  </>
                ) : (
                  "You won't have a default resume until you add another."
                )}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : null}
                Delete resume
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
