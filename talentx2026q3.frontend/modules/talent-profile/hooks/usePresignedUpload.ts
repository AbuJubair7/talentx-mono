"use client"

import { useCallback, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { ApiError } from "@/lib/api/axios"

import { talentProfileService } from "../services/talent-profile.service"
import type { PresignedUploadStatus, UsePresignedUploadResult } from "../types"
import { putWithProgress } from "../utils/storage-put"
import { talentProfileKeys } from "./query-keys"

// Single-PUT presigned upload for the profile picture: request the upload
// target, PUT the raw file bytes directly to storage, then confirm — only
// after the PUT succeeds, so a failed upload never leaves a phantom
// confirmed key.
//
// `requestIdRef` mirrors the request-tracking pattern in useMultipartUpload:
// there's no server-side "abort" for a single presigned PUT, but re-selecting
// a picture while a prior upload is still mid-flight (slow PUT/confirm) must
// not let the older selection's `confirm()` land after the newer one and
// overwrite the newer photo. Every `upload()` call claims a new id; each
// checkpoint verifies it's still the current one before touching state or
// calling the network, so a superseded call becomes a silent no-op instead
// of racing the newer one.
export function usePresignedUpload(): UsePresignedUploadResult {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<PresignedUploadStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const reset = useCallback(() => {
    requestIdRef.current += 1
    setStatus("idle")
    setProgress(0)
    setError(null)
  }, [])

  const upload = useCallback(
    async (file: File) => {
      const requestId = ++requestIdRef.current
      const isCurrentRequest = () => requestIdRef.current === requestId

      setError(null)
      setProgress(0)

      try {
        setStatus("requesting-url")
        console.log("[Photo Upload] 1. Requesting upload URL target from backend for type:", file.type)
        const target = await talentProfileService.requestProfilePictureUploadUrl(file.type)
        console.log("[Photo Upload] 2. Presigned URL target received:", target)
        if (!isCurrentRequest()) return

        setStatus("uploading")
        console.log("[Photo Upload] 3. Uploading file to storage:", { name: file.name, size: file.size })
        await putWithProgress(target.uploadUrl, file, file.type, (progressPercentage) => {
          if (isCurrentRequest()) setProgress(progressPercentage)
        })
        console.log("[Photo Upload] 4. Direct storage PUT completed successfully!")
        if (!isCurrentRequest()) return

        setStatus("confirming")
        console.log("[Photo Upload] 5. Confirming upload with backend for storageKey:", target.storageKey)
        await talentProfileService.confirmProfilePictureUpload(target.storageKey)
        if (!isCurrentRequest()) return

        setStatus("success")
        console.log("[Photo Upload] 6. Photo upload confirmed & completed!")
        await queryClient.invalidateQueries({ queryKey: talentProfileKeys.detail() })
      } catch (uploadError: unknown) {
        if (!isCurrentRequest()) return
        setStatus("error")
        const apiError = uploadError as ApiError | Error
        console.error("[Photo Upload] Failure at status:", status)
        console.error("[Photo Upload Error Object]:", uploadError)
        setError(apiError?.message ?? "Upload failed. Please try again.")
        throw uploadError
      }
    },
    [queryClient]
  )

  return { status, progress, error, upload, reset }
}
