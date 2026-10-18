"use client"

import { useEffect, useRef, useState } from "react"

// Shared blob-URL-lifecycle logic for a local file preview (profile picture,
// video intro): each selected file gets its own `URL.createObjectURL` preview,
// which pins that file's bytes in memory until explicitly revoked. This hook
// owns that lifecycle so callers never have to reimplement it: revoke the
// previous preview URL before creating the next one, and revoke whatever is
// still outstanding on unmount.
export function useObjectUrlPreview(): {
  previewUrl: string | null
  setPreviewFile: (file: File) => void
} {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  function setPreviewFile(file: File) {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const nextObjectUrl = URL.createObjectURL(file)
    objectUrlRef.current = nextObjectUrl
    setPreviewUrl(nextObjectUrl)
  }

  return { previewUrl, setPreviewFile }
}
