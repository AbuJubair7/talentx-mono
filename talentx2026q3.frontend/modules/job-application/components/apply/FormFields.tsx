import React, { useState } from 'react';
import { AlertCircle, PencilLine } from 'lucide-react';
import { toast } from 'sonner';
import { ResumeSelectCard, ResumeUploadOption, type SavedResume } from '@/modules/resumes';
import { MAX_RESUME_FILE_SIZE_BYTES } from '../../schemas/apply-schema';

interface FormFieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  edited?: boolean
  optional?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({
  id,
  label,
  hint,
  error,
  edited,
  optional,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className={`text-sm font-medium text-slate-900 ${!optional ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}`}
        >
          {label}
          {optional ? (
            <span className="ml-1.5 font-normal text-slate-500">(optional)</span>
          ) : null}
        </label>
        {edited ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <PencilLine className="h-3 w-3" aria-hidden="true" />
            Edited
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
        >
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

interface ResumeFieldProps {
  choice: 'saved' | 'new'
  onChoiceChange: (choice: 'saved' | 'new') => void
  resumes: SavedResume[]
  maxResumes: number
  selectedResumeId: string | null
  onSelectResume: (id: string) => void
  onPreviewResume: (resume: SavedResume) => void
  saveToLibrary: boolean
  onSaveToLibraryChange: (value: boolean) => void
  uploadedFile: File | null
  onUpload: (file: File | null) => void
  error?: string
}

export function ResumeField({
  choice,
  onChoiceChange,
  resumes,
  maxResumes,
  selectedResumeId,
  onSelectResume,
  onPreviewResume,
  saveToLibrary,
  onSaveToLibraryChange,
  uploadedFile,
  onUpload,
  error,
}: ResumeFieldProps) {
  const [sizeError, setSizeError] = useState<string | null>(null)
  const isAtLimit = resumes.length >= maxResumes

  const selectFile = (file: File | null) => {
    if (!file) return

    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      const message = 'File size exceeds the maximum allowed limit of 5 MB. Please upload a smaller PDF or DOCX file.'
      setSizeError(message)
      toast.error('Resume too large', { description: message })
      return
    }

    setSizeError(null)
    onChoiceChange('new')
    onUpload(file)
  }

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Resume</legend>

      <ul role="list" className="flex flex-col gap-2">
        {resumes.map((resume) => (
          <li key={resume.id}>
            <ResumeSelectCard
              resume={resume}
              selected={choice === 'saved' && selectedResumeId === resume.id}
              onSelect={(target) => {
                onChoiceChange('saved')
                onSelectResume(target.id)
              }}
              onPreview={onPreviewResume}
            />
          </li>
        ))}

        <li>
          <ResumeUploadOption
            selected={choice === 'new'}
            file={uploadedFile}
            hasSavedResumes={resumes.length > 0}
            onSelect={() => onChoiceChange('new')}
            onFileSelected={selectFile}
            onRemoveFile={() => {
              setSizeError(null)
              onUpload(null)
              if (resumes.length > 0) {
                const fallback = resumes.find((resume) => resume.isDefault) ?? resumes[0]
                onChoiceChange('saved')
                onSelectResume(fallback.id)
              }
            }}
          />
        </li>
      </ul>

      {uploadedFile && resumes.length > 0 ? (
        <label className="mt-3 flex items-start gap-2.5 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={saveToLibrary}
            disabled={isAtLimit}
            onChange={(e) => onSaveToLibraryChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-emerald-600 disabled:opacity-50"
          />
          <span>
            Also save this resume to my profile
            <span className="mt-0.5 block text-slate-500">
              {isAtLimit
                ? `You already have ${maxResumes} saved resumes. Delete one to save this file.`
                : 'Reuse it for future applications.'}
            </span>
          </span>
        </label>
      ) : null}

      {sizeError || error ? (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {sizeError || error}
        </p>
      ) : null}
    </fieldset>
  )
}
