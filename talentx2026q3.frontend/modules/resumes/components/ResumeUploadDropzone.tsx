'use client'

import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useResumeUpload } from '../hooks/useResumeUpload'
import { ResumeExtractionResult } from '../types/resume.types'
import { UploadDropzoneView } from './UploadDropzoneView'
import { ExtractionProcessing } from './ExtractionProcessing'
import { ExtractionError } from './ExtractionError'
import { formatBytes } from '../utils/resume-format'
import type { FileMeta, UploadState } from '../types/upload.types'

export interface ResumeUploadMutationLike {
  mutate: (
    file: File,
    options?: {
      onSuccess?: (data: ResumeExtractionResult) => void
      onError?: (error: unknown) => void
    }
  ) => void
  isPending: boolean
}

interface ResumeUploadDropzoneProps {
  onExtractionSuccess?: (data: ResumeExtractionResult, file: File) => void
  uploadMutation?: ResumeUploadMutationLike
  // Selection-only mode: validate the file and hand it back without uploading.
  onFileSelected?: (file: File) => void
  showHeader?: boolean
  title?: string
  description?: string
  className?: string
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1]

export function ResumeUploadDropzone({
  onExtractionSuccess,
  uploadMutation: injectedUploadMutation,
  onFileSelected,
  showHeader = false,
  title,
  description,
  className,
}: ResumeUploadDropzoneProps) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  const defaultUploadMutation = useResumeUpload()
  const uploadMutation = injectedUploadMutation ?? defaultUploadMutation

  const state: UploadState = uploadMutation.isPending
    ? 'loading'
    : hasError && fileMeta
    ? 'error'
    : 'default'

  const validateAndUpload = (file: File) => {
    setValidationError(null)
    setExtractionError(null)
    setHasError(false)

    // Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`This file is ${formatBytes(file.size)}. The limit is 5 MB.`)
      return
    }

    // Check extension
    const lower = file.name.toLowerCase()
    if (!ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      setValidationError("That file type isn't supported. Please upload a PDF or DOCX.")
      return
    }

    if (onFileSelected) {
      onFileSelected(file)
      return
    }

    if (!onExtractionSuccess) return

    setCurrentFile(file)
    setFileMeta({ name: file.name, size: file.size })

    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        setHasError(false)
        setExtractionError(null)
        onExtractionSuccess(data, file)
      },
      onError: (error: unknown) => {
        setHasError(true)
        const apiError = error as { status?: number | null; message?: string } | undefined
        const message =
          apiError?.status === 502
            ? 'The AI service encountered a temporary connection issue while parsing your document.'
            : apiError?.message || 'An unexpected error occurred while parsing resume.'
        setExtractionError(message)
      },
    })
  }

  const handleRetry = () => {
    if (currentFile) {
      validateAndUpload(currentFile)
    }
  }

  const handleReset = () => {
    setHasError(false)
    setValidationError(null)
    setExtractionError(null)
    setCurrentFile(null)
    setFileMeta(null)
  }

  return (
    <div
      className={cn(
        'w-full max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden',
        className
      )}
    >
      {showHeader && (
        <header className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <h2 id="resume-upload-title" className="text-base font-semibold text-slate-900">
            {title || 'Import your resume'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {description || "We'll pull your experience, skills, and education into your profile so you can skip the typing."}
          </p>
        </header>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
          className="p-6 sm:p-8"
        >
          {state === 'default' && (
            <UploadDropzoneView
              onFileSelected={validateAndUpload}
              validationError={validationError}
            />
          )}

          {state === 'loading' && (
            <ExtractionProcessing
              file={
                fileMeta ??
                (currentFile
                  ? { name: currentFile.name, size: currentFile.size }
                  : { name: 'Resume', size: 0 })
              }
            />
          )}

          {state === 'error' && (fileMeta || currentFile) && (
            <ExtractionError
              file={fileMeta ?? { name: currentFile!.name, size: currentFile!.size }}
              errorMessage={extractionError}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
