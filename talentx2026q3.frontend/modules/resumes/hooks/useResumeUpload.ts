import { useCallback, useRef } from "react"
import { useMutation, type MutateOptions } from "@tanstack/react-query"
import { toast } from "sonner"
import { uploadResume } from "../services/resume.service"
import { ResumeExtractionResult } from "../types/resume.types"
import { ApiError } from "@/lib/api/axios"

export function useResumeUpload() {
  const lastCallRef = useRef<{
    file: File
    options?: MutateOptions<ResumeExtractionResult, ApiError, File, unknown>
  } | null>(null)

  const mutation = useMutation<ResumeExtractionResult, ApiError, File>({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      toast.success("Resume parsed successfully!", {
        description: `Extracted profile for ${data.fullName || "candidate"}.`,
      })
    },
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
        toast.error("Unprocessable Resume", {
          description: "No extractable text found. Please upload a standard text-based PDF/DOCX.",
        })
      } else if (error.status === 502) {
        toast.error("Service Temporarily Unavailable", {
          description: "AI extraction service encountered a temporary error. Please try again.",
          action: {
            label: "Retry",
            onClick: () => retry(),
          },
        })
      } else {
        toast.error("Upload Failed", {
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
