"use client"

import { useState } from "react"
import { FileTextIcon, LoaderCircleIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { ResumeExtractionResult } from "../types/resume.types"
import { useSaveResume } from "../hooks/useSaveResume"
import { ResumeUploadDropzone } from "./ResumeUploadDropzone"
import { ReviewExtractedProfileDialog } from "./ReviewExtractedProfileDialog"

interface SaveResumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveResumeDialog({ open, onOpenChange }: SaveResumeDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [updateProfile, setUpdateProfile] = useState(false)
  const [stagedExtraction, setStagedExtraction] = useState<ResumeExtractionResult | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const saveMutation = useSaveResume()

  function reset() {
    setFile(null)
    setDisplayName("")
    setUpdateProfile(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && saveMutation.isPending) return
    if (!nextOpen) {
      reset()
    }
    onOpenChange(nextOpen)
  }

  async function handleSave() {
    if (!file) return

    try {
      const savedResume = await saveMutation.mutateAsync({
        file,
        displayName: displayName.trim() || undefined,
        updateProfile,
      })

      reset()
      onOpenChange(false)

      if (savedResume.aiServiceUnavailable) {
        toast.warning("Resume saved to your library.", {
          description: "AI profile extraction is temporarily unavailable, so your profile was not updated.",
        })
      } else if (savedResume.extractedProfile) {
        setStagedExtraction(savedResume.extractedProfile)
        setIsReviewOpen(true)
      }
    } catch {
      // The mutation hook already surfaces the error as a toast.
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add a resume</DialogTitle>
            <DialogDescription>
              Save a resume to your profile so you can reuse it when applying to jobs.
            </DialogDescription>
          </DialogHeader>

          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-slate-200">
                  <FileTextIcon aria-hidden="true" className="h-4 w-4 text-slate-600" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={saveMutation.isPending}
                className="shrink-0 rounded-sm text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Change file
              </button>
            </div>
          ) : (
            <ResumeUploadDropzone className="max-w-none border-0 bg-transparent shadow-none rounded-none overflow-visible" onFileSelected={setFile} />
          )}

          <div className="space-y-3">
            <label htmlFor="resume-display-name" className="block text-sm font-medium text-slate-900">
              Resume name <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="resume-display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={100}
              placeholder="e.g. Backend Engineer Resume"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0"
            />
            <p className="text-xs text-slate-500">
              Defaults to the file name if left blank.
            </p>

            <label className="flex items-start gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={updateProfile}
                onChange={(event) => setUpdateProfile(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              />
              <span>
                Also update my profile from this resume
                <span className="mt-0.5 block text-xs text-slate-500">
                  We&apos;ll run AI extraction and refresh your skills, work experience, education, and projects.
                </span>
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!file || saveMutation.isPending}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {saveMutation.isPending ? (
                <>
                  <LoaderCircleIcon aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save resume"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReviewExtractedProfileDialog
        open={isReviewOpen}
        extractionResult={stagedExtraction}
        onOpenChange={setIsReviewOpen}
      />
    </>
  )
}
