import type { WizardSnapshot } from "../store/job-wizard-store"

// One backup per browser; the employer id inside decides whose it is.
export const WIZARD_BACKUP_KEY = "talentx:job-wizard-backup"

// Bumped when the stored shape changes, so an old backup is ignored instead of breaking the wizard.
const WIZARD_BACKUP_VERSION = 2

// The wizard's progress as kept in localStorage, so a crash or power cut doesn't lose it.
export interface WizardBackup extends WizardSnapshot {
  version: typeof WIZARD_BACKUP_VERSION
  employerId: string
  savedAt: string
  draftJobId: string | null
  // Whether the employer chose to save the draft, so leaving after a resume doesn't ask "keep or delete?" again.
  keptOnPurpose: boolean
}

// Returns true when a parsed value has the fields the wizard needs.
function isWizardBackup(value: unknown): value is WizardBackup {
  if (!value || typeof value !== "object") return false
  const backup = value as Partial<WizardBackup>
  return (
    backup.version === WIZARD_BACKUP_VERSION &&
    typeof backup.employerId === "string" &&
    typeof backup.savedAt === "string" &&
    typeof backup.formData === "object" &&
    backup.formData !== null &&
    typeof backup.currentStep === "number" &&
    Array.isArray(backup.completedSteps) &&
    typeof backup.aiGenerated === "object" &&
    backup.aiGenerated !== null &&
    typeof backup.keptOnPurpose === "boolean"
  )
}

// Reads this employer's backup; anything missing, unreadable, outdated or belonging to someone else counts as none
// (another employer's backup is also removed, so it can't show up later).
export function readWizardBackup(employerId: string): WizardBackup | null {
  try {
    const raw = window.localStorage.getItem(WIZARD_BACKUP_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isWizardBackup(parsed)) return null
    if (parsed.employerId !== employerId) {
      window.localStorage.removeItem(WIZARD_BACKUP_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

// Stores the backup, replacing any previous one; returns false when storage is full or blocked.
export function writeWizardBackup(backup: Omit<WizardBackup, "version">): boolean {
  try {
    window.localStorage.setItem(WIZARD_BACKUP_KEY, JSON.stringify({ ...backup, version: WIZARD_BACKUP_VERSION }))
    return true
  } catch {
    // Private mode or quota exceeded: the wizard keeps working, only the crash protection is lost.
    return false
  }
}

// Removes the backup (after publish, save, discard or logout).
export function clearWizardBackup(): void {
  try {
    window.localStorage.removeItem(WIZARD_BACKUP_KEY)
  } catch {
    // Storage blocked: nothing was stored either.
  }
}
