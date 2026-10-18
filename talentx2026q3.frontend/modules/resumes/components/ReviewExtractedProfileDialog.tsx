"use client"

import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"
import { ExtractedProfileReview } from "./ExtractedProfileReview"
import { useApplyExtractedProfile } from "@/modules/talent-profile/hooks/useApplyExtractedProfile"
import { buildApplyExtractionPayload } from "@/modules/talent-profile/utils/build-apply-extraction-payload"

export interface ReviewExtractedProfileDialogProps {
  open: boolean
  extractionResult: ResumeExtractionResult | null
  onOpenChange: (open: boolean) => void
  onApplied?: () => void
}

export function ReviewExtractedProfileDialog({
  open,
  extractionResult,
  onOpenChange,
  onApplied,
}: ReviewExtractedProfileDialogProps) {
  const applyExtractedProfileMutation = useApplyExtractedProfile()

  async function handleSaved(reviewedResult: ResumeExtractionResult) {
    try {
      const payload = buildApplyExtractionPayload(reviewedResult)
      await applyExtractedProfileMutation.mutateAsync({ payload })
      toast.success("Profile updated from resume.")
      onApplied?.()
      onOpenChange(false)
    } catch {
      // Handled by the mutation hook's error callback.
    }
  }

  return (
    <Dialog open={open && Boolean(extractionResult)} onOpenChange={onOpenChange}>
      {extractionResult ? (
        <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-y-auto sm:max-w-4xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Review extracted profile</DialogTitle>
            <DialogDescription>
              Review and edit your profile details extracted from your resume before updating.
            </DialogDescription>
          </DialogHeader>
          <ExtractedProfileReview
            data={extractionResult}
            onReset={() => onOpenChange(false)}
            onSaved={handleSaved}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
