"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { useJobWizardStore } from "../store/job-wizard-store"
import { clearWizardBackup, writeWizardBackup } from "../utils/wizard-backup"

// Wait after the last change before writing, so typing doesn't write on every keystroke.
export const WIZARD_BACKUP_DELAY_MS = 500

// Outcome of the latest backup write: none yet, kept on this device (with when), or storage refused it.
export type WizardBackupStatus =
  | { state: "idle" }
  | { state: "saved"; savedAt: string }
  | { state: "failed" }

interface UseWizardBackupOptions {
  employerId: string | undefined
  isDirty: boolean
  draftJobId: string | null
  keptOnPurpose: boolean
}

// Keeps a localStorage copy of the wizard while it has unsaved changes, so a crash or power cut can't lose them.
// Writes 500 ms after the last change and at once when the tab is hidden or closed.
export function useWizardBackup({ employerId, isDirty, draftJobId, keptOnPurpose }: UseWizardBackupOptions) {
  const { formData, currentStep, completedSteps, aiGenerated } = useJobWizardStore()
  const [status, setStatus] = useState<WizardBackupStatus>({ state: "idle" })
  const stoppedRef = useRef(false)
  const writeNowRef = useRef<() => void>(() => undefined)

  // Writes the current wizard state, unless there is nothing unsaved or the employer chose to leave.
  useEffect(() => {
    writeNowRef.current = () => {
      if (!employerId || !isDirty || stoppedRef.current) return
      const state = useJobWizardStore.getState()
      const savedAt = new Date().toISOString()
      const written = writeWizardBackup({
        employerId,
        savedAt,
        formData: state.formData,
        currentStep: state.currentStep,
        completedSteps: [...state.completedSteps],
        aiGenerated: state.aiGenerated,
        draftJobId,
        keptOnPurpose,
      })
      setStatus(written ? { state: "saved", savedAt } : { state: "failed" })
    }
  }, [employerId, isDirty, draftJobId, keptOnPurpose])

  useEffect(() => {
    if (!employerId || !isDirty) return
    const timer = window.setTimeout(() => writeNowRef.current(), WIZARD_BACKUP_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [employerId, isDirty, draftJobId, keptOnPurpose, formData, currentStep, completedSteps, aiGenerated])

  useEffect(() => {
    // Hiding the tab is the last moment that is reliable before a lid close, shutdown or crash.
    function flush() {
      if (document.visibilityState === "hidden") writeNowRef.current()
    }
    function flushOnPageHide() {
      writeNowRef.current()
    }

    document.addEventListener("visibilitychange", flush)
    window.addEventListener("pagehide", flushOnPageHide)
    return () => {
      document.removeEventListener("visibilitychange", flush)
      window.removeEventListener("pagehide", flushOnPageHide)
    }
  }, [])

  // Removes the backup; with `stop`, nothing is written again (the employer is leaving on purpose).
  const discardBackup = useCallback((options?: { stop?: boolean }) => {
    if (options?.stop) stoppedRef.current = true
    clearWizardBackup()
    setStatus({ state: "idle" })
  }, [])

  return { status, discardBackup }
}
