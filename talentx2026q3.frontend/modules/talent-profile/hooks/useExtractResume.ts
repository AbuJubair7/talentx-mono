import { useCallback, useRef } from "react"
import { useMutation, type MutateOptions } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import { talentProfileService } from "../services/talent-profile.service"

// Talent-profile-local equivalent of modules/resumes/hooks/useResumeUpload —
// deliberately a separate hook because it posts to a different, cookie-authed
// endpoint (`POST /talents/me/resume/extract`) than the anonymous
// `/Resumes/upload` one useResumeUpload calls; sharing one hook across both
// would tangle two unrelated flows together for no benefit. This is
// extraction-only: nothing is written to storage until the Talent confirms
// via useApplyExtractedProfile.
export function useExtractResume() {
  const lastCallRef = useRef<{
    file: File
    options?: MutateOptions<ResumeExtractionResult, ApiError, File, unknown>
  } | null>(null)

  const mutation = useMutation<ResumeExtractionResult, ApiError, File>({
    mutationFn: (file) => talentProfileService.extractResume(file),
    onError: (error, file) => {
      const retry = () => {
        if (lastCallRef.current) {
          mutation.mutate(lastCallRef.current.file, lastCallRef.current.options)
        } else {
          mutation.mutate(file)
        }
      }

      if (error.status === 400) {
        toast.error("Invalid File", {
          description: error.message || "File must be PDF or DOCX and under 5 MB.",
        })
      } else if (error.status === 422) {
        toast.error("Unprocessable resume", {
          description: "No extractable text found. Please upload a standard text-based PDF/DOCX.",
        })
      } else if (error.status === 502) {
        toast.error("Service temporarily unavailable", {
          description: "AI extraction service encountered a temporary error. Please try again.",
          action: {
            label: "Retry",
            onClick: () => retry(),
          },
        })
      } else {
        toast.error("Upload failed", {
          description:
            error.message === "Internal Server Error"
              ? "Something went wrong on the server. Please try again."
              : error.message || "An unexpected error occurred while parsing resume.",
          action: {
            label: "Retry",
            onClick: () => retry(),
          },
        })
      }
    },
  })

  const mutate = useCallback(
    (
      file: File,
      options?: MutateOptions<ResumeExtractionResult, ApiError, File, unknown>
    ) => {
      lastCallRef.current = { file, options }
      mutation.mutate(file, options)
    },
    [mutation]
  )

  return {
    ...mutation,
    mutate,
  }
}
