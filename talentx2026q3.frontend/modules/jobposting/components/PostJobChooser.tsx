"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { employerJobKeys, employerJobsService } from "@/modules/employer-jobs"
import type { EmployerJobListItemDto, EmployerJobsQueryParams } from "@/modules/employer-jobs/types/employer-job.types"

import { meService } from "../services/me.service"
import { clearWizardBackup, readWizardBackup, type WizardBackup } from "../utils/wizard-backup"

const POST_JOB_PATH = "/job/jobpost"

// Opens the wizard with the local backup restored.
const RESUME_PATH = `${POST_JOB_PATH}?resume=1`

// Enough to list every realistic set of drafts in one request.
const DRAFTS_QUERY: EmployerJobsQueryParams = { status: "Draft", pageSize: 50 }

// A recent draft list is reused for this long, so repeated clicks open the popup instantly.
const DRAFTS_STALE_MS = 30_000

// The draft fields the chooser shows.
type Draft = Pick<EmployerJobListItemDto, "id" | "title" | "createdAt">

// What the popup offers: server drafts and/or the local backup of an unsaved job.
interface Choices {
  drafts: Draft[]
  backup: WizardBackup | null
}

// Formats a draft's creation date for the picker, e.g. "Oct 7, 2026".
function formatCreatedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Formats when the backup was written, e.g. "Oct 8, 2026, 10:42 AM".
function formatSavedAt(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
}

// Returns the drafts newest first.
function newestFirst(drafts: Draft[]): Draft[] {
  return [...drafts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Returns true for a plain left click on an in-app link to the Post a Job page.
function isPostJobClick(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false

  const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null
  if (!anchor || anchor.target === "_blank") return false

  const url = new URL(anchor.href, window.location.href)
  return url.origin === window.location.origin && url.pathname === POST_JOB_PATH && url.search === ""
}

// Mounted once per page for employers (portal layout and public Header): turns every "Post a Job" link into "resume,
// continue a draft or start fresh?" when there is something to continue, on the current page. Catching clicks here
// (capture phase, like useUnsavedChangesGuard) instead of inside each link keeps the popup alive when the clicked
// link's menu or mobile sidebar closes itself.
export function PostJobChooser() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [choices, setChoices] = useState<Choices | null>(null)
  const [view, setView] = useState<"ask" | "pick">("ask")
  const isCheckingRef = useRef(false)

  useEffect(() => {
    // Looks up the drafts and the employer's local backup, then opens the popup, or the wizard when there is
    // nothing to continue. A failed lookup counts as "nothing", so it never blocks posting.
    async function openChooser() {
      if (isCheckingRef.current) return
      isCheckingRef.current = true
      try {
        const [draftsResult, employerResult] = await Promise.allSettled([
          queryClient.fetchQuery({
            queryKey: employerJobKeys.jobsList(DRAFTS_QUERY),
            queryFn: ({ signal }) => employerJobsService.getJobs(DRAFTS_QUERY, signal),
            staleTime: DRAFTS_STALE_MS,
          }),
          queryClient.fetchQuery({ queryKey: ["me"], queryFn: meService.getCurrentEmployer }),
        ])
        const drafts = draftsResult.status === "fulfilled" ? newestFirst(draftsResult.value.items) : []
        const backup = employerResult.status === "fulfilled" ? readWizardBackup(employerResult.value.id) : null

        if (drafts.length === 0 && !backup) {
          router.push(POST_JOB_PATH)
          return
        }
        setView("ask")
        setChoices({ drafts, backup })
      } finally {
        isCheckingRef.current = false
      }
    }

    // Stops next/link from navigating (it skips default-prevented clicks); the link's own onClick still runs.
    function handleClick(event: MouseEvent) {
      if (!isPostJobClick(event)) return
      // Already on the wizard: nothing to choose, and its unsaved-changes guard stays in charge.
      if (window.location.pathname === POST_JOB_PATH) return
      event.preventDefault()
      void openChooser()
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [queryClient, router])

  // Closes the popup and goes to the given page.
  function goTo(href: string) {
    setChoices(null)
    router.push(href)
  }

  // A new job replaces the unsaved one, so its backup goes first.
  function handleStartFresh() {
    if (choices?.backup) clearWizardBackup()
    goTo(POST_JOB_PATH)
  }

  // One draft opens directly; several show the picker.
  function handleContinue() {
    if (!choices) return
    if (choices.drafts.length === 1) {
      goTo(`/job/${choices.drafts[0].id}/edit`)
      return
    }
    setView("pick")
  }

  if (!choices) return null
  const { drafts, backup } = choices
  const backupTitle = backup?.formData.title.trim()

  // Outside click or Esc only closes the popup; the employer stays on the current page and the backup is kept.
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) setChoices(null)
      }}
    >
      <DialogContent showCloseButton={false}>
        {view === "ask" ? (
          <>
            <DialogTitle>You have unfinished job posts</DialogTitle>
            <DialogDescription>
              {backup
                ? "Pick up where you left off, or start a new job post."
                : drafts.length === 1
                  ? "Start a new job post, or continue your saved draft."
                  : `Start a new job post, or continue one of your ${drafts.length} saved drafts.`}
            </DialogDescription>

            {backup && (
              <button
                type="button"
                onClick={() => goTo(RESUME_PATH)}
                className="mt-1 flex w-full cursor-pointer flex-col items-start rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-left hover:bg-emerald-100"
              >
                <span className="font-medium text-emerald-900">Resume unsaved job</span>
                <span className="text-xs text-emerald-800">
                  {backupTitle ? `"${backupTitle}" · ` : ""}auto-saved {formatSavedAt(backup.savedAt)}
                </span>
              </button>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleStartFresh} className="cursor-pointer">
                Start fresh
              </Button>
              {drafts.length > 0 && (
                <Button
                  variant={backup ? "outline" : "default"}
                  onClick={handleContinue}
                  className="cursor-pointer"
                >
                  Continue from draft ({drafts.length})
                </Button>
              )}
            </div>
            {backup && (
              <p className="text-right text-xs text-muted-foreground">
                Start fresh discards your unsaved job.
              </p>
            )}
          </>
        ) : (
          <>
            <DialogTitle>Choose a draft</DialogTitle>
            <DialogDescription>Newest first. You&apos;ll continue editing it on its edit page.</DialogDescription>
            <ul className="max-h-80 space-y-1 overflow-y-auto pt-1">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <button
                    type="button"
                    onClick={() => goTo(`/job/${draft.id}/edit`)}
                    className="flex w-full cursor-pointer flex-col items-start rounded-md border px-3 py-2 text-left hover:bg-muted"
                  >
                    <span className="font-medium">{draft.title}</span>
                    <span className="text-xs text-muted-foreground">
                      Created {formatCreatedDate(draft.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex justify-start pt-2">
              <Button variant="outline" onClick={() => setView("ask")} className="cursor-pointer">
                Back
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
