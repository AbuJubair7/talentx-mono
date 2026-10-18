"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

import { useCurrentEmployer } from "../hooks/useCurrentEmployer"
import { useDraftSaver } from "../hooks/useDraftSaver"
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard"
import { useWizardBackup } from "../hooks/useWizardBackup"
import { useJobWizardStore } from "../store/job-wizard-store"
import type { CreateJobPayload } from "../types/job.types"
import { readWizardBackup, type WizardBackup } from "../utils/wizard-backup"
import { WizardLayout } from "./wizard/WizardLayout"
import type { SaveStatus } from "./wizard/SaveStatusIndicator"
import { Step1JobTitle } from "./wizard/Step1JobTitle"
import { Step2JobDetails } from "./wizard/Step2JobDetails"
import { Step3Location } from "./wizard/Step3Location"
import { Step4Skills } from "./wizard/Step4Skills"
import { Step5Description } from "./wizard/Step5Description"
import { Step6Review } from "./wizard/Step6Review"

// Placeholder deadline for a draft saved before the employer has reached Step 2
// and picked a real expiry date. Sending "" would fail to deserialize against
// the backend's non-nullable DateTime field. Overwritten the moment they set a
// real date; never affects a published job since JobRules.EnsurePublishable is
// checked separately, at actual publish time.
const DRAFT_EXPIRE_AT_PLACEHOLDER_DAYS = 30

export function CreateJobView() {
  const router = useRouter()
  const { currentStep, formData, resetWizard } = useJobWizardStore()
  const { data: currentEmployer } = useCurrentEmployer()
  const {
    draftJobId,
    keptOnPurpose,
    serverSavedAt,
    saveError,
    isSubmitting,
    saveDraft,
    publish,
    deleteDraft,
    adoptDraft,
  } = useDraftSaver()

  // Snapshot of formData as last persisted. Taken at mount (not a hard-coded blank
  // form) so pre-filled store state doesn't count as unsaved.
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(formData))

  // Step1JobTitle auto-fills the read-only company name from the verified employer's
  // profile once it loads — a system default, not something the employer typed, so it
  // must not itself trip the unsaved-changes guard. The snapshot above was taken before
  // that profile fetch resolves, so here the comparison baseline folds the employer's
  // companyName in at read time, without rewriting the stored snapshot. Only companyName
  // is patched (not the whole formData), so any real edit already made in the meantime
  // still counts as dirty.
  const comparisonSnapshot = useMemo(() => {
    if (!currentEmployer?.companyName) return savedSnapshot
    if (formData.companyName !== currentEmployer.companyName) return savedSnapshot

    const parsedSnapshot = JSON.parse(savedSnapshot) as typeof formData
    if (parsedSnapshot.companyName === currentEmployer.companyName) return savedSnapshot
    return JSON.stringify({ ...parsedSnapshot, companyName: currentEmployer.companyName })
  }, [savedSnapshot, currentEmployer, formData.companyName])

  const isDirty = JSON.stringify(formData) !== comparisonSnapshot
  // A draft that Next created (not one the employer chose to save) needs a "keep or delete?" answer before leaving.
  const hasUnconfirmedDraft = draftJobId !== null && !keptOnPurpose
  const { isPrompting, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty || hasUnconfirmedDraft, {
    warnOnUnload: isDirty,
  })

  const employerId = currentEmployer?.id
  const { status: backupStatus, discardBackup } = useWizardBackup({
    employerId,
    isDirty,
    draftJobId,
    keptOnPurpose,
  })

  // Unsaved changes report the server error or the device backup; with none, the last server save.
  const saveStatus: SaveStatus =
    isDirty && saveError
      ? { kind: "server-error" }
      : isDirty && backupStatus.state === "failed"
        ? { kind: "failed" }
        : isDirty && backupStatus.state === "saved"
          ? { kind: "device", at: backupStatus.savedAt }
          : !isDirty && serverSavedAt
            ? { kind: "account", at: serverSavedAt }
            : null
  // A backup found when the wizard was opened directly; the banner asks whether to resume it.
  const [pendingBackup, setPendingBackup] = useState<WizardBackup | null>(null)
  const [isDiscardOpen, setIsDiscardOpen] = useState(false)
  const isBannerShown = pendingBackup !== null && !isDirty
  // A leave or discard answer waiting on the server (save or delete), and its failure message.
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)

  // Puts a backup back into the wizard. The mount-time snapshot stays the baseline, so the restored work still
  // counts as unsaved (guard on, backup kept) until it is saved or published.
  const resumeBackup = useCallback(
    (backup: WizardBackup) => {
      useJobWizardStore.getState().restore(backup)
      adoptDraft(backup.draftJobId, backup.keptOnPurpose)
      setPendingBackup(null)
    },
    [adoptDraft]
  )

  // With ?resume=1 (the Post a Job popup) the backup is restored right away; otherwise the banner offers it.
  // Re-running is harmless, which keeps Strict Mode's mount → reset → mount working.
  useEffect(() => {
    if (!employerId) return
    const backup = readWizardBackup(employerId)
    if (!backup) return
    // The backup lives in localStorage and is only readable once the employer id has loaded.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (new URLSearchParams(window.location.search).get("resume") === "1") {
      resumeBackup(backup)
    } else {
      setPendingBackup(backup)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [employerId, resumeBackup])

  // Throws away the job in progress after confirmation: this wizard's draft deleted, backup removed, blank Step 1.
  async function handleConfirmDiscard() {
    setIsResolving(true)
    const deleted = await deleteDraft()
    setIsResolving(false)
    if (!deleted) return
    discardBackup()
    resetWizard()
    setSavedSnapshot(JSON.stringify(useJobWizardStore.getState().formData))
    setPendingBackup(null)
    setIsDiscardOpen(false)
  }

  // Leaves after the warning; the backup goes too, since the employer decided.
  function leaveNow() {
    setResolveError(null)
    discardBackup({ stop: true })
    confirmLeave()
  }

  // "Keep draft": saves the current step first when it has changes, then leaves.
  async function handleKeepDraftAndLeave() {
    if (isDirty) {
      setIsResolving(true)
      const saved = await saveCurrentStep(true)
      setIsResolving(false)
      if (!saved) {
        setResolveError("Couldn't save your changes. Check your connection and try again.")
        return
      }
    }
    leaveNow()
  }

  // "Delete draft": deletes this wizard's draft, then leaves.
  async function handleDeleteDraftAndLeave() {
    setIsResolving(true)
    const deleted = await deleteDraft()
    setIsResolving(false)
    if (!deleted) {
      setResolveError("Couldn't delete the draft. Check your connection and try again.")
      return
    }
    leaveNow()
  }

  // "Stay" closes the warning and clears any error from an earlier attempt.
  function handleStay() {
    setResolveError(null)
    cancelLeave()
  }

  // Leaving the job-posting page (route change/unmount) clears the wizard so
  // returning later — e.g. via "Post a Job" again — starts from a blank Step 1
  // instead of silently resuming a stale in-progress or drafted form. Does not
  // fire on in-wizard step changes, since the component stays mounted for those.
  // Unsaved changes are guarded by useUnsavedChangesGuard before the employer can leave.
  useEffect(() => {
    return () => {
      resetWizard()
    }
  }, [resetWizard])

  function validateStep(step: number): string[] {
    const errors: string[] = []

    switch (step) {
      case 1:
        if (!formData.title || formData.title.trim().length === 0) {
          errors.push("title:Title must not be empty")
        } else if (formData.title.trim().length < 5) {
          errors.push("title:Title must have minimum 5 characters")
        }
        if (!formData.companyName || formData.companyName.trim().length === 0) {
          errors.push("companyName:Company name must not be empty")
        } else if (formData.companyName.trim().length < 2) {
          errors.push("companyName:Company name must have minimum 2 characters")
        }
        break
      case 2:
        if (!formData.employmentType) {
          errors.push("employmentType:Employment type must not be empty")
        }
        if (!formData.experienceLevel) {
          errors.push("experienceLevel:Experience level must not be empty")
        }
        if (!formData.vacancies || formData.vacancies < 1) {
          errors.push("vacancies:Vacancies must not be empty")
        }
        if (!formData.expireAt) {
          errors.push("expireAt:Expire date must not be empty")
        } else {
          const selected = new Date(formData.expireAt)
          const today = new Date()
          selected.setHours(0, 0, 0, 0)
          today.setHours(0, 0, 0, 0)
          if (selected < today) {
            errors.push("expireAt:Expire date must not be empty")
          }
        }
        if (!formData.salaryType) {
          errors.push("salaryType:Salary type must not be empty")
        } else if (formData.salaryType === "Fixed" || formData.salaryType === "Range") {
          if (!formData.salaryCurrency) {
            errors.push("salaryCurrency:Currency must not be empty")
          }
          if (!formData.salaryPeriod) {
            errors.push("salaryPeriod:Period must not be empty")
          }
          if (formData.salaryType === "Fixed") {
            if (formData.salaryMin === undefined || formData.salaryMin === null || formData.salaryMin <= 0) {
              errors.push("salaryMin:Salary amount must be greater than 0")
            }
          } else if (formData.salaryType === "Range") {
            if (formData.salaryMin === undefined || formData.salaryMin === null || formData.salaryMin <= 0) {
              errors.push("salaryMin:Min salary amount must be greater than 0")
            }
            if (formData.salaryMax === undefined || formData.salaryMax === null || formData.salaryMax <= 0) {
              errors.push("salaryMax:Max salary amount must be greater than 0")
            } else if (formData.salaryMin !== undefined && formData.salaryMin > 0 && formData.salaryMax <= formData.salaryMin) {
              errors.push("salaryMax:Max salary must be greater than min salary")
            }
          }
        }
        break
      case 3:
        if (!formData.location || formData.location.trim().length === 0) {
          errors.push("location:Location must not be empty")
        } else if (formData.location.trim().length < 5) {
          errors.push("location:Location must have minimum 5 characters")
        }
        if (!formData.workArrangement) {
          errors.push("workArrangement:Work arrangement must not be empty")
        }
        if (formData.workArrangement === "OnSite" || formData.workArrangement === "Hybrid") {
          if (!formData.city || formData.city.trim().length === 0) {
            errors.push("city:City is mandatory for OnSite/Hybrid work mode")
          } else if (formData.city.trim().length < 2) {
            errors.push("city:City must have minimum 2 characters")
          }
          if (!formData.country || formData.country.trim().length === 0) {
            errors.push("country:Country is mandatory for OnSite/Hybrid work mode")
          } else if (formData.country.trim().length < 2) {
            errors.push("country:Country must have minimum 2 characters")
          }
        }
        if (formData.workArrangement === "FullRemote") {
          if (!formData.minOverlapHours || formData.minOverlapHours <= 0) {
            errors.push("minOverlapHours:Minimum overlap hours is mandatory for Full Remote work mode")
          } else if (formData.minOverlapHours > 8) {
            errors.push("minOverlapHours:Overlap hours must be between 1 and 8")
          }
        }
        break
      case 4:
        if (!formData.requiredSkills || formData.requiredSkills.length === 0) {
          errors.push("requiredSkills:Required skills must have at least one skill")
        }
        break
      case 5:
        if (!formData.description || formData.description.trim().length === 0) {
          errors.push("description:Description must not be empty")
        } else if (formData.description.trim().length < 20) {
          errors.push("description:Description must have minimum 20 characters")
        }
        if (!formData.requirements || formData.requirements.trim().length === 0) {
          errors.push("requirements:Requirements must not be empty")
        } else if (formData.requirements.trim().length < 15) {
          errors.push("requirements:Requirements must have minimum 15 characters")
        }
        break
    }

    return errors
  }

  // Reads the store at call time, so a save queued from a click sends what was on screen at that click.
  function buildPayload(publish: boolean) {
    const formData = useJobWizardStore.getState().formData
    const isNegotiableSalary = formData.salaryType === "Negotiable" || !formData.salaryType
    return {
      ...formData,
      salaryMin: isNegotiableSalary ? undefined : formData.salaryMin,
      salaryMax:
        isNegotiableSalary || formData.salaryType === "Fixed"
          ? formData.salaryType === "Fixed"
            ? formData.salaryMin
            : undefined
          : formData.salaryMax,
      salaryCurrency: isNegotiableSalary ? undefined : formData.salaryCurrency,
      salaryPeriod: isNegotiableSalary ? undefined : formData.salaryPeriod,
      expireAt: formData.expireAt
        ? new Date(formData.expireAt).toISOString()
        : new Date(Date.now() + DRAFT_EXPIRE_AT_PLACEHOLDER_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      publish,
    }
  }

  // Saves the form as a draft; on success it becomes the "saved" baseline and the backup goes, unless edits were
  // typed while the request was in flight.
  async function saveCurrentStep(silent: boolean): Promise<boolean> {
    const snapshot = JSON.stringify(useJobWizardStore.getState().formData)
    const saved = await saveDraft({ payload: buildPayload(false) as CreateJobPayload, silent })
    if (saved) {
      setSavedSnapshot(snapshot)
      if (JSON.stringify(useJobWizardStore.getState().formData) === snapshot) discardBackup()
    }
    return saved
  }

  // "Save & exit": saves what isn't on the server yet (nothing, right after a Next), then goes to the jobs list.
  // A failed save keeps the employer here, with the error toast, so nothing is lost.
  async function handleSaveAndExit() {
    if (!formData.title || formData.title.trim().length === 0) {
      useJobWizardStore.getState().setFieldErrors({ title: "Title is required to save a draft" })
      return
    }
    useJobWizardStore.getState().clearFieldErrors()

    if (isDirty || !draftJobId) {
      const saved = await saveCurrentStep(false)
      if (!saved) return
    } else {
      toast.success("Job saved as draft.")
    }
    // No resetWizard() here: emptying the form before leaving would look "unsaved" to the guard for a moment;
    // the unmount below resets it.
    discardBackup({ stop: true })
    router.push("/job/job-listing")
  }

  // Every completed step is saved as a draft in the background, so it survives a switch of device.
  function handleStepComplete() {
    void saveCurrentStep(true)
  }

  // Publishes the draft (or a new job), then leaves for the jobs list.
  async function handlePublish() {
    const published = await publish(buildPayload(true) as CreateJobPayload)
    if (!published) return
    // Reset happens on unmount, like Save & exit, so the guard never sees an emptied form.
    discardBackup({ stop: true })
    router.push("/job/job-listing")
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <Step1JobTitle />
      case 2:
        return <Step2JobDetails />
      case 3:
        return <Step3Location />
      case 4:
        return <Step4Skills />
      case 5:
        return <Step5Description />
      case 6:
        return <Step6Review />
      default:
        return <Step1JobTitle />
    }
  }

  return (
    <>
      <WizardLayout
        onSaveDraft={handleSaveAndExit}
        onPublish={handlePublish}
        onDiscard={() => setIsDiscardOpen(true)}
        canDiscard={isDirty || draftJobId !== null}
        saveStatus={saveStatus}
        onStepComplete={handleStepComplete}
        isSubmitting={isSubmitting}
        validateStep={validateStep}
      >
        {/* Hidden once the employer starts typing: the new work replaces the old backup. */}
        {isBannerShown && pendingBackup && (
          <div
            role="status"
            aria-label="Unsaved job post"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p>
              You have an unsaved job post
              {pendingBackup.formData.title.trim() ? ` "${pendingBackup.formData.title.trim()}"` : ""} from{" "}
              {new Date(pendingBackup.savedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.
              Starting a new one here replaces it.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDiscardOpen(true)} className="cursor-pointer">
                Discard
              </Button>
              <Button onClick={() => resumeBackup(pendingBackup)} className="cursor-pointer">
                Resume
              </Button>
            </div>
          </div>
        )}
        {renderStep()}
      </WizardLayout>

      <Dialog
        open={isDiscardOpen}
        onOpenChange={(open) => {
          if (!open) setIsDiscardOpen(false)
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogTitle>Discard this job post?</DialogTitle>
          <DialogDescription>
            {isBannerShown
              ? `The unsaved job post${pendingBackup?.formData.title.trim() ? ` "${pendingBackup.formData.title.trim()}"` : ""} will be removed from this device. This can't be undone.`
              : draftJobId
                ? "The draft saved so far will be deleted and the form starts again from Step 1. This can't be undone."
                : "Your changes will be lost and the form starts again from Step 1. This can't be undone."}
          </DialogDescription>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDiscardOpen(false)} className="cursor-pointer">
              Keep editing
            </Button>
            <Button
              onClick={handleConfirmDiscard}
              disabled={isResolving}
              className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
            >
              {isResolving ? "Discarding..." : "Discard"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPrompting}
        onOpenChange={(open) => {
          if (!open && !isResolving) handleStay()
        }}
      >
        <DialogContent showCloseButton={false}>
          {draftJobId ? (
            <>
              <DialogTitle>Keep this job as a draft?</DialogTitle>
              <DialogDescription>
                {formData.title.trim() ? `"${formData.title.trim()}" is saved as a draft.` : "This job is saved as a draft."}
                {isDirty && ` Your changes on Step ${currentStep} aren't saved yet.`}
              </DialogDescription>
              {resolveError && <p className="text-sm text-rose-600">{resolveError}</p>}
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleStay} disabled={isResolving} className="cursor-pointer">
                  Stay
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteDraftAndLeave}
                  disabled={isResolving}
                  className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Delete draft
                </Button>
                <Button onClick={handleKeepDraftAndLeave} disabled={isResolving} className="cursor-pointer">
                  {isResolving ? "Saving..." : "Keep draft"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogTitle>Leave without saving?</DialogTitle>
              <DialogDescription>
                Nothing has been saved yet. If you leave now, what you typed will be lost.
              </DialogDescription>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleStay} className="cursor-pointer">
                  Stay
                </Button>
                <Button
                  onClick={leaveNow}
                  className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
                >
                  Leave anyway
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
