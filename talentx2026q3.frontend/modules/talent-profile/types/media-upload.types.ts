export interface PresignedUploadTarget {
  uploadUrl: string
  storageKey: string
  expiresAt?: string | null
  httpMethod?: string | null
}

export interface InitiateMultipartResult {
  uploadId: string
  storageKey: string
  partSizeBytes: number
}

export interface UploadedPartInfo {
  partNumber: number
  eTag: string
  sizeBytes: number
}

export interface PartETag {
  partNumber: number
  eTag: string
}

export interface MultipartUploadSession {
  uploadId: string
  storageKey: string
  fileName: string
  fileSize: number
  fileLastModified: number
}

export type FileFingerprint = Pick<File, "name" | "size" | "lastModified">

export interface UploadRequest {
  cancelled: boolean
  storageKey: string | null
  uploadId: string | null
  file: File
}

export type PresignedUploadStatus = "idle" | "requesting-url" | "uploading" | "confirming" | "success" | "error"

export interface UsePresignedUploadResult {
  status: PresignedUploadStatus
  progress: number
  error: string | null
  upload: (file: File) => Promise<void>
  reset: () => void
}

export type MultipartUploadStatus =
  | "idle"
  | "initiating"
  | "uploading"
  | "completing"
  | "success"
  | "error"
  | "cancelled"

export interface UseMultipartUploadResult {
  status: MultipartUploadStatus
  progress: number
  error: string | null
  upload: (file: File) => Promise<void>
  cancel: () => Promise<void>
  reset: () => void
}

export interface StoragePutResult {
  eTag: string | null
}

export interface UploadMultipartPartsOptions {
  file: File
  storageKey: string
  uploadId: string
  alreadyUploadedParts: Map<number, string>
  request: UploadRequest
  onProgress: (percentage: number) => void
  requestPartUploadUrl: (storageKey: string, uploadId: string, partNumber: number) => Promise<string>
}
