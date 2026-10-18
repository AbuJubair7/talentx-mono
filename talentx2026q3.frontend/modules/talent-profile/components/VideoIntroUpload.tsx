"use client"

import { useState } from "react"
import { UploadIcon, XIcon } from "lucide-react"

import { fieldDescribedBy, fieldErrorId, fieldHintId } from "@/components/common/form/FieldWrapper"

import { useMultipartUpload } from "../hooks/useMultipartUpload"
import { useObjectUrlPreview } from "../hooks/useObjectUrlPreview"
import type { VideoIntroUploadProps } from "../types"

const ALLOWED_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
const VIDEO_INTRO_INPUT_ID = "video-intro-input"

export function VideoIntroUpload({ currentVideoUrl }: VideoIntroUploadProps) {
  const { status, progress, error, upload, cancel, reset } = useMultipartUpload()
  const [clientErrorMessage, setClientErrorMessage] = useState<string | null>(null)
  const { previewUrl: localPreviewUrl, setPreviewFile } = useObjectUrlPreview()

  const isUploading = status === "initiating" || status === "uploading" || status === "completing"

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    event.target.value = ""
    if (!selectedFile) return

    setClientErrorMessage(null)

    if (isUploading) {
      await cancel()
    } else {
      reset()
    }

    if (!ALLOWED_CONTENT_TYPES.includes(selectedFile.type)) {
      setClientErrorMessage("Please choose an MP4, WEBM, or MOV video.")
      return
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setClientErrorMessage("Video must be 50 MB or smaller.")
      return
    }

    setPreviewFile(selectedFile)
    upload(selectedFile).catch(() => {
      // Error state is surfaced via hook error state
    })
  }
  const playbackUrl = localPreviewUrl ?? currentVideoUrl ?? undefined
  const combinedErrorMessage = clientErrorMessage ?? error
  const actionLabel = currentVideoUrl ? "Replace video" : "Upload video"

  return (
    <div className="flex flex-col gap-3">
      {playbackUrl ? (
        <video
          controls
          src={playbackUrl}
          aria-label="Video introduction preview"
          className="w-full max-w-md rounded-md border border-slate-200"
        />
      ) : (
        <div className="flex h-40 w-full max-w-md items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          No video introduction yet.
        </div>
      )}

      <div className="flex items-center gap-3">
        <label
          htmlFor={VIDEO_INTRO_INPUT_ID}
          className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <UploadIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {actionLabel}
        </label>
        <input
          id={VIDEO_INTRO_INPUT_ID}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          aria-label={actionLabel}
          className="sr-only"
          onChange={handleFileSelected}
          aria-describedby={fieldDescribedBy(VIDEO_INTRO_INPUT_ID, Boolean(combinedErrorMessage), true)}
        />

        {isUploading ? (
          <button
            type="button"
            onClick={() => cancel()}
            aria-label="Cancel video upload"
            className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors duration-150 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
          >
            <XIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Cancel
          </button>
        ) : null}
      </div>

      <p id={fieldHintId(VIDEO_INTRO_INPUT_ID)} className="text-xs text-slate-500">
        MP4, WEBM, or MOV — up to 50 MB.
      </p>

      {isUploading ? (
        <div
          className="h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Video upload progress"
        >
          <div
            className="h-full bg-slate-900 transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      <div role="status" aria-live="polite" className="text-xs font-medium text-slate-500">
        {isUploading ? `Uploading… ${progress}%` : null}
        {status === "success" ? "Video introduction updated." : null}
        {status === "cancelled" ? "Upload cancelled." : null}
      </div>

      {combinedErrorMessage ? (
        <p id={fieldErrorId(VIDEO_INTRO_INPUT_ID)} role="alert" className="text-xs font-medium text-rose-600">
          {combinedErrorMessage}
        </p>
      ) : null}
    </div>
  )
}
