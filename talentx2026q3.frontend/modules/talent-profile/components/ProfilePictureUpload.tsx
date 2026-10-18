"use client"

import { useState } from "react"
import { Loader2Icon, UploadIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fieldDescribedBy, fieldErrorId, fieldHintId } from "@/components/common/form/FieldWrapper"

import { useObjectUrlPreview } from "../hooks/useObjectUrlPreview"
import { usePresignedUpload } from "../hooks/usePresignedUpload"
import type { ProfilePictureUploadProps } from "../types"
import { initialsFor } from "../utils/initials"

const PROFILE_PICTURE_INPUT_ID = "profile-picture-input"

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export function ProfilePictureUpload({ currentPictureUrl, nameForInitials = "" }: ProfilePictureUploadProps) {
  const { status, progress, error, upload, reset } = usePresignedUpload()
  const { previewUrl: localPreviewUrl, setPreviewFile } = useObjectUrlPreview()
  const [clientErrorMessage, setClientErrorMessage] = useState<string | null>(null)

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ""
    if (!selectedFile) return

    setClientErrorMessage(null)
    reset()

    if (!ALLOWED_CONTENT_TYPES.includes(selectedFile.type)) {
      setClientErrorMessage("Please choose a JPEG, PNG, or WEBP image.")
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setClientErrorMessage("Image must be 5 MB or smaller.")
      return
    }

    console.log("[ProfilePictureUpload UI] Selected file for upload:", {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    })
    setPreviewFile(selectedFile)
    upload(selectedFile).catch((uploadError) => {
      console.error("[ProfilePictureUpload UI Catch]:", uploadError)
    })
  }

  const isUploading = status === "requesting-url" || status === "uploading" || status === "confirming"
  const displayedImageUrl = localPreviewUrl ?? currentPictureUrl ?? undefined
  const combinedErrorMessage = clientErrorMessage ?? error
  const actionLabel = currentPictureUrl ? "Replace photo" : "Upload photo"

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar size="lg">
          <AvatarImage src={displayedImageUrl} alt={nameForInitials || "Candidate avatar"} />
          <AvatarFallback>{nameForInitials ? initialsFor(nameForInitials) : "U"}</AvatarFallback>
        </Avatar>
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin text-white" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={PROFILE_PICTURE_INPUT_ID}
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
        >
          <UploadIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {actionLabel}
        </label>
        <input
          id={PROFILE_PICTURE_INPUT_ID}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label={actionLabel}
          className="sr-only"
          onChange={handleFileSelected}
          aria-describedby={fieldDescribedBy(PROFILE_PICTURE_INPUT_ID, Boolean(combinedErrorMessage), true)}
        />

        <p id={fieldHintId(PROFILE_PICTURE_INPUT_ID)} className="text-xs text-slate-500">
          JPEG, PNG, or WEBP — up to 5 MB.
        </p>

        {isUploading ? (
          <div
            className="h-1.5 w-36 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile photo upload progress"
          >
            <div
              className="h-full bg-slate-900 transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        <div role="status" aria-live="polite" className="text-xs font-medium text-slate-500">
          {isUploading ? `Uploading… ${progress}%` : null}
          {status === "success" ? "Photo updated." : null}
        </div>

        {combinedErrorMessage ? (
          <p id={fieldErrorId(PROFILE_PICTURE_INPUT_ID)} role="alert" className="text-xs font-medium text-rose-600">
            {combinedErrorMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
