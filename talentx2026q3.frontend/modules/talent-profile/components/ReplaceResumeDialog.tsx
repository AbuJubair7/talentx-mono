"use client"

import { useState } from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ResumeUploadDropzone, type ResumeUploadMutationLike } from "@/modules/resumes"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import { ExtractedProfileReview } from "@/modules/resumes/components/ExtractedProfileReview"
import { useApplyExtractedProfile } from "../hooks/useApplyExtractedProfile"
import { useExtractResume } from "../hooks/useExtractResume"
import type { ReplaceResumeDialogProps } from "../types"
import { buildApplyExtractionPayload } from "../utils/build-apply-extraction-payload"

export function ReplaceResumeDialog({ open, isOpen, onOpenChange, onClose }: ReplaceResumeDialogProps) {
  const resolvedOpen = isOpen ?? open ?? false
  const [extractionResult, setExtractionResult] = useState<ResumeExtractionResult | null>(null)
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null)

  const extractResumeMutation = useExtractResume()
  const applyExtractedProfileMutation = useApplyExtractedProfile()

  const dropzoneUploadMutation: ResumeUploadMutationLike = {
    isPending: extractResumeMutation.isPending,
    mutate: (file, options) => {
      setSelectedResumeFile(file)
      extractResumeMutation.mutate(file, options)
    },
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setExtractionResult(null)
      setSelectedResumeFile(null)
      onClose?.()
    }
    onOpenChange?.(nextOpen)
  }

  async function handleSaved(result: ResumeExtractionResult) {
    if (!selectedResumeFile) return

    const payload = buildApplyExtractionPayload(result)

    await applyExtractedProfileMutation.mutateAsync({ payload, resumeFile: selectedResumeFile })
    handleOpenChange(false)
  }

  return (
    <Dialog open={resolvedOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Replace your resume</DialogTitle>
          <DialogDescription>
            Upload a new resume — we&apos;ll re-run extraction and let you review the details before saving.
          </DialogDescription>
        </DialogHeader>

        {!extractionResult ? (
          <ResumeUploadDropzone className="max-w-none border-0 bg-transparent shadow-none rounded-none overflow-visible" uploadMutation={dropzoneUploadMutation} onExtractionSuccess={setExtractionResult} />
        ) : (
          <ExtractedProfileReview
            data={extractionResult}
            onReset={() => setExtractionResult(null)}
            onSaved={handleSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
