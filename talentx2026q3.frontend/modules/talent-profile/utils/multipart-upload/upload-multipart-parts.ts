import type { PartETag, UploadMultipartPartsOptions } from "../../types"
import { putWithProgress } from "../storage-put"
import { calculateTotalParts, sliceChunk } from "./slice-file-chunks"

export async function uploadMultipartParts({
  file,
  storageKey,
  uploadId,
  alreadyUploadedParts,
  request,
  onProgress,
  requestPartUploadUrl,
}: UploadMultipartPartsOptions): Promise<PartETag[]> {
  const totalParts = calculateTotalParts(file.size)
  const completedParts: PartETag[] = []

  for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
    if (request.cancelled) return completedParts

    const alreadyUploadedETag = alreadyUploadedParts.get(partNumber)
    if (alreadyUploadedETag) {
      completedParts.push({ partNumber, eTag: alreadyUploadedETag })
      onProgress(Math.round((partNumber / totalParts) * 100))
      continue
    }

    const chunk = sliceChunk(file, partNumber)
    const partUploadUrl = await requestPartUploadUrl(storageKey, uploadId, partNumber)
    const partsBeforeThis = partNumber - 1

    const { eTag } = await putWithProgress(partUploadUrl, chunk, file.type, (chunkProgressPercentage) => {
      const overallProgressPercentage = ((partsBeforeThis + chunkProgressPercentage / 100) / totalParts) * 100
      onProgress(Math.round(overallProgressPercentage))
    })

    if (!eTag) {
      throw new Error(
        `Chunk ${partNumber} upload did not return an ETag — check that the storage endpoint exposes the ` +
          "ETag response header via CORS (Access-Control-Expose-Headers: ETag) for cross-origin PUTs."
      )
    }

    completedParts.push({ partNumber, eTag })
  }

  return completedParts
}
