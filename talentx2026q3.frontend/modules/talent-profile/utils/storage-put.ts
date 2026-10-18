import axios, { type AxiosProgressEvent } from "axios"
import type { StoragePutResult } from "../types"

export async function putWithProgress(
  uploadUrl: string,
  body: Blob,
  contentType: string,
  onProgress: (progressPercentage: number) => void
): Promise<StoragePutResult> {
  try {
    console.log("[storage-put] Dispatching PUT to storage:", { uploadUrl, contentType, bodySize: body.size })
    const uploadResponse = await axios.put(uploadUrl, body, {
      headers: {
        "Content-Type": contentType,
      },
      withCredentials: false,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }
      },
    })

    console.log("[storage-put] Storage response status:", uploadResponse.status, "headers:", uploadResponse.headers)

    return {
      eTag: (uploadResponse.headers["etag"] as string | undefined) ?? null,
    }
  } catch (putError: unknown) {
    console.error("[storage-put] Storage PUT failed. Full error:", putError)
    if (axios.isAxiosError(putError)) {
      console.error("[storage-put] Axios error details:", {
        message: putError.message,
        code: putError.code,
        status: putError.response?.status,
        statusText: putError.response?.statusText,
        data: putError.response?.data,
        requestUrl: putError.config?.url,
        requestHeaders: putError.config?.headers,
      })
    }
    throw putError
  }
}
