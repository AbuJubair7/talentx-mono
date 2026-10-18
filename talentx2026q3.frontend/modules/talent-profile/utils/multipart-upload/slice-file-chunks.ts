export const PART_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export function calculateTotalParts(fileSize: number, partSizeBytes: number = PART_SIZE_BYTES): number {
  return Math.max(1, Math.ceil(fileSize / partSizeBytes))
}

export function sliceChunk(file: File, partNumber: number, partSizeBytes: number = PART_SIZE_BYTES): Blob {
  const chunkStart = (partNumber - 1) * partSizeBytes
  const chunkEnd = Math.min(chunkStart + partSizeBytes, file.size)
  return file.slice(chunkStart, chunkEnd)
}
