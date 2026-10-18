"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { FileTextIcon, InfoIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useDeleteResume } from "../hooks/useDeleteResume"
import { useRenameResume } from "../hooks/useRenameResume"
import { useSavedResumes } from "../hooks/useSavedResumes"
import { useSetDefaultResume } from "../hooks/useSetDefaultResume"
import { MAX_SAVED_RESUMES, type SavedResume } from "../types/resume.types"
import { sortResumes } from "../utils/resume-format"
import { DeleteResumeDialog } from "./DeleteResumeDialog"
import { RenameResumeDialog } from "./RenameResumeDialog"
import { ResumeCard, type ResumeBusyState } from "./ResumeCard"
import { ResumeCounter } from "./ResumeCounter"
import { ResumeEmptyState } from "./ResumeEmptyState"
import { ResumeListError } from "./ResumeListError"
import { ResumePreviewDialog } from "./ResumePreviewDialog"
import { ResumeSkeletons } from "./ResumeSkeletons"
import { SaveResumeDialog } from "./SaveResumeDialog"

export function ResumeLibrarySection() {
  const { data, isPending, isError, refetch } = useSavedResumes()
  const deleteMutation = useDeleteResume()
  const renameMutation = useRenameResume()
  const setDefaultMutation = useSetDefaultResume()

  const [isAddOpen, setIsAddOpen] = useState(false)
  // Dialog targets are kept after close so the exit animation has content to render.
  const [previewResume, setPreviewResume] = useState<SavedResume | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [renameResume, setRenameResume] = useState<SavedResume | null>(null)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<SavedResume | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const resumes = sortResumes(data?.resumes ?? [])
  const maxResumes = data?.maxResumes ?? MAX_SAVED_RESUMES
  const status = isPending ? "loading" : isError ? "error" : "ready"
  const isAtLimit = status === "ready" && resumes.length >= maxResumes
  const nextDefault =
    isDeleteOpen && resumeToDelete
      ? (resumes.find((resume) => resume.id !== resumeToDelete.id) ?? null)
      : null

  function busyFor(resumeId: string): ResumeBusyState | undefined {
    if (deleteMutation.isPending && deleteMutation.variables === resumeId) return "deleting"
    if (renameMutation.isPending && renameMutation.variables?.id === resumeId) return "saving"
    if (setDefaultMutation.isPending && setDefaultMutation.variables === resumeId) return "saving"
    return undefined
  }

  return (
    <section
      aria-labelledby="resumes-heading"
      className="rounded-md border border-slate-100 bg-white p-6 shadow-xs"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="flex shrink-0 items-center justify-center text-emerald-700">
              <FileTextIcon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
            </span>
            <h2 id="resumes-heading" className="text-base font-bold text-slate-900">
              Resumes
            </h2>
            <ResumeCounter status={status} used={resumes.length} max={maxResumes} />
          </div>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Keep your resumes organized and ready to apply.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          disabled={status !== "ready" || isAtLimit}
          title={isAtLimit ? `You can save up to ${maxResumes} resumes.` : undefined}
          className="shrink-0 self-start bg-slate-900 text-white hover:bg-slate-800"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add resume
        </Button>
      </header>

      {isAtLimit ? (
        <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span>
            <span className="font-medium text-slate-900">
              You&apos;ve reached the {maxResumes}-resume limit.
            </span>{" "}
            Delete one you no longer need to add another.
          </span>
        </p>
      ) : null}

      <div className="mt-5">
        {status === "loading" ? <ResumeSkeletons /> : null}

        {status === "error" ? <ResumeListError onRetry={() => void refetch()} /> : null}

        {status === "ready" && resumes.length === 0 ? (
          <ResumeEmptyState max={maxResumes} />
        ) : null}

        {status === "ready" && resumes.length > 0 ? (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  busy={busyFor(resume.id)}
                  onPreview={(target) => {
                    setPreviewResume(target)
                    setIsPreviewOpen(true)
                  }}
                  onRename={(target) => {
                    setRenameResume(target)
                    setIsRenameOpen(true)
                  }}
                  onSetDefault={(target) => setDefaultMutation.mutate(target.id)}
                  onDelete={(target) => {
                    setResumeToDelete(target)
                    setIsDeleteOpen(true)
                  }}
                />
              ))}
            </AnimatePresence>
          </ul>
        ) : null}
      </div>

      <SaveResumeDialog open={isAddOpen} onOpenChange={setIsAddOpen} />

      <ResumePreviewDialog
        resume={previewResume}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />

      <RenameResumeDialog
        key={`${renameResume?.id ?? "none"}-${isRenameOpen}`}
        resume={renameResume}
        open={isRenameOpen}
        isSaving={renameMutation.isPending && renameMutation.variables?.id === renameResume?.id}
        onOpenChange={setIsRenameOpen}
        onSave={(displayName) => {
          if (!renameResume) return
          renameMutation.mutate(
            { id: renameResume.id, displayName },
            { onSuccess: () => setIsRenameOpen(false) },
          )
        }}
      />

      <DeleteResumeDialog
        open={isDeleteOpen}
        resume={resumeToDelete}
        nextDefault={nextDefault}
        isDeleting={deleteMutation.isPending && deleteMutation.variables === resumeToDelete?.id}
        onOpenChange={setIsDeleteOpen}
        onConfirm={() => {
          if (!resumeToDelete) return
          deleteMutation.mutate(resumeToDelete.id, {
            onSettled: () => setIsDeleteOpen(false),
          })
        }}
      />
    </section>
  )
}
