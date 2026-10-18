"use client"

import { useCallback, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/lib/api/axios"
import { employerJobKeys, employerJobsService } from "@/modules/employer-jobs"

import { jobsService } from "../services/jobs.service"
import type { CreateJobPayload } from "../types/job.types"

// Shows a failed request the way the other job mutations do.
function toastError(error: unknown) {
  const apiError = error as ApiError
  toast.error(apiError?.message || "Something went wrong. Please try again.", {
    description: apiError?.errors?.join(" "),
  })
}

// Owns the wizard's server draft: creates it once, then updates, publishes or deletes that same job. Every call runs
// in one queue, so two quick Next clicks can't create two drafts and publish never races an auto-save.
export function useDraftSaver() {
  const queryClient = useQueryClient()
  const [draftJobId, setDraftJobId] = useState<string | null>(null)
  // True once the employer chose to save (Save & exit): leaving then needs no "keep or delete?" question.
  const [keptOnPurpose, setKeptOnPurpose] = useState(false)
  const [serverSavedAt, setServerSavedAt] = useState<string | null>(null)
  const [saveError, setSaveError] = useState(false)
  const [pendingVisible, setPendingVisible] = useState(0)

  // The queued tasks read the id from here; state would be stale inside them.
  const draftJobIdRef = useRef<string | null>(null)
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())

  // Keeps the ref and the rendered id in step.
  const setId = useCallback((id: string | null) => {
    draftJobIdRef.current = id
    setDraftJobId(id)
  }, [])

  // Runs a task after every earlier one has finished, even if an earlier one failed.
  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const run = queueRef.current.then(task, task)
    queueRef.current = run.catch(() => undefined)
    return run
  }, [])

  // Refreshes every list that shows this job.
  const invalidateJobLists = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: employerJobKeys.all })
    queryClient.invalidateQueries({ queryKey: ["jobs"] })
    queryClient.invalidateQueries({ queryKey: ["home", "recent-jobs"] })
  }, [queryClient])

  // Wraps a visible (non-silent) action so the buttons can show "Saving..." / "Publishing...".
  const trackVisible = useCallback(async <T,>(silent: boolean, action: () => Promise<T>): Promise<T> => {
    if (silent) return action()
    setPendingVisible((count) => count + 1)
    try {
      return await action()
    } finally {
      setPendingVisible((count) => count - 1)
    }
  }, [])

  // Creates the draft or updates it; silent saves (Next, Keep draft) show no toast. Resolves to whether it worked.
  const saveDraft = useCallback(
    ({ payload, silent }: { payload: CreateJobPayload; silent: boolean }) =>
      trackVisible(silent, () =>
        enqueue(async () => {
          try {
            const id = draftJobIdRef.current
            if (id) {
              await jobsService.updateJob(id, payload)
            } else {
              setId(await jobsService.createJob(payload))
            }
            setServerSavedAt(new Date().toISOString())
            setSaveError(false)
            if (!silent) {
              setKeptOnPurpose(true)
              toast.success("Job saved as draft.")
            }
            invalidateJobLists()
            return true
          } catch (error) {
            setSaveError(true)
            if (!silent) toastError(error)
            return false
          }
        })
      ),
    [enqueue, invalidateJobLists, setId, trackVisible]
  )

  // Publishes the draft (or a new job when none exists yet).
  const publish = useCallback(
    (payload: CreateJobPayload) =>
      trackVisible(false, () =>
        enqueue(async () => {
          try {
            const id = draftJobIdRef.current
            if (id) {
              await jobsService.updateJob(id, payload)
            } else {
              await jobsService.createJob(payload)
            }
            toast.success("Job published.")
            invalidateJobLists()
            return true
          } catch (error) {
            toastError(error)
            return false
          }
        })
      ),
    [enqueue, invalidateJobLists, trackVisible]
  )

  // Deletes the draft this wizard created or resumed; with no draft there is nothing to do.
  const deleteDraft = useCallback(
    () =>
      trackVisible(false, () =>
        enqueue(async () => {
          const id = draftJobIdRef.current
          if (!id) return true
          try {
            await employerJobsService.deleteJob(id)
            setId(null)
            setKeptOnPurpose(false)
            setServerSavedAt(null)
            setSaveError(false)
            invalidateJobLists()
            return true
          } catch (error) {
            toastError(error)
            return false
          }
        })
      ),
    [enqueue, invalidateJobLists, setId, trackVisible]
  )

  // Continues a draft recovered from the local backup.
  const adoptDraft = useCallback(
    (id: string | null, kept: boolean) => {
      setId(id)
      setKeptOnPurpose(kept)
    },
    [setId]
  )

  return {
    draftJobId,
    keptOnPurpose,
    serverSavedAt,
    saveError,
    isSubmitting: pendingVisible > 0,
    saveDraft,
    publish,
    deleteDraft,
    adoptDraft,
  }
}
