"use client"

import { useCallback, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { ApiError } from "@/lib/api/axios"

import { talentProfileService } from "../services/talent-profile.service"
import type { MultipartUploadStatus, UploadRequest, UseMultipartUploadResult } from "../types"
import {
  clearMultipartSession,
  readMultipartSession,
  uploadMultipartParts,
  writeMultipartSession,
} from "../utils/multipart-upload"
import { talentProfileKeys } from "./query-keys"

export function useMultipartUpload(): UseMultipartUploadResult {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<MultipartUploadStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const currentRequestRef = useRef<UploadRequest | null>(null)

  const reset = useCallback(() => {
    setStatus("idle")
    setProgress(0)
    setError(null)
    currentRequestRef.current = null
  }, [])

  const cancel = useCallback(async () => {
    const request = currentRequestRef.current
    if (!request) return

    request.cancelled = true
    setStatus("cancelled")

    if (request.storageKey && request.uploadId) {
      try {
        await talentProfileService.abortVideoMultipartUpload(request.storageKey, request.uploadId)
      } catch {
        // Best-effort cleanup
      }
      clearMultipartSession(request.file)
    }

    if (currentRequestRef.current === request) {
      currentRequestRef.current = null
    }
  }, [])

  const upload = useCallback(
    async (file: File) => {
      if (currentRequestRef.current && !currentRequestRef.current.cancelled) {
        await cancel()
      }

      const request: UploadRequest = { cancelled: false, storageKey: null, uploadId: null, file }
      currentRequestRef.current = request

      setError(null)
      setProgress(0)
      setStatus("initiating")

      try {
        const existingSession = readMultipartSession(file)
        let uploadId: string
        let storageKey: string
        const alreadyUploadedParts = new Map<number, string>()

        if (existingSession) {
          uploadId = existingSession.uploadId
          storageKey = existingSession.storageKey
          try {
            const listedParts = await talentProfileService.listVideoMultipartParts(storageKey, uploadId)
            listedParts.forEach((part) => alreadyUploadedParts.set(part.partNumber, part.eTag))
          } catch (resumeError) {
            const apiError = resumeError as ApiError
            if (apiError?.status === 404) {
              clearMultipartSession(file)
            }
            throw resumeError
          }
        } else {
          const initiated = await talentProfileService.initiateVideoMultipartUpload(file.type)
          uploadId = initiated.uploadId
          storageKey = initiated.storageKey
          writeMultipartSession(file, {
            uploadId,
            storageKey,
            fileName: file.name,
            fileSize: file.size,
            fileLastModified: file.lastModified,
          })
        }

        request.storageKey = storageKey
        request.uploadId = uploadId

        if (request.cancelled) {
          try {
            await talentProfileService.abortVideoMultipartUpload(storageKey, uploadId)
          } catch {
            // Best-effort cleanup
          }
          clearMultipartSession(file)
          return
        }

        setStatus("uploading")

        const completedParts = await uploadMultipartParts({
          file,
          storageKey,
          uploadId,
          alreadyUploadedParts,
          request,
          onProgress: setProgress,
          requestPartUploadUrl: talentProfileService.requestVideoPartUploadUrl,
        })

        if (request.cancelled) return

        setStatus("completing")
        await talentProfileService.completeVideoMultipartUpload(storageKey, uploadId, completedParts)

        clearMultipartSession(file)
        if (currentRequestRef.current === request) {
          currentRequestRef.current = null
        }
        setStatus("success")
        setProgress(100)
        await queryClient.invalidateQueries({ queryKey: talentProfileKeys.detail() })
      } catch (uploadError) {
        if (request.cancelled) return
        setStatus("error")
        const apiError = uploadError as ApiError | Error
        console.error("[Video Upload] Upload failed:", uploadError)
        setError(apiError?.message ?? "Video upload failed. Please try again.")
        throw uploadError
      }
    },
    [cancel, queryClient]
  )

  return { status, progress, error, upload, cancel, reset }
}
