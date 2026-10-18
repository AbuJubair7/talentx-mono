import {
  WIZARD_BACKUP_KEY,
  clearWizardBackup,
  readWizardBackup,
  writeWizardBackup,
  type WizardBackup,
} from "../utils/wizard-backup"
import { useJobWizardStore } from "../store/job-wizard-store"

// A backup for employer "emp-1" with a title typed in.
function backupFor(employerId = "emp-1"): Omit<WizardBackup, "version"> {
  return {
    employerId,
    savedAt: "2026-10-08T10:42:00.000Z",
    formData: { ...useJobWizardStore.getState().formData, title: "Senior React Developer" },
    currentStep: 3,
    completedSteps: [1, 2],
    aiGenerated: { skills: true, description: false, requirements: false },
    draftJobId: null,
    keptOnPurpose: false,
  }
}

beforeEach(() => window.localStorage.clear())

afterEach(() => jest.restoreAllMocks())

// Proves the backup survives a round trip, belongs to one employer, and never breaks the wizard when storage fails.
describe("wizard backup", () => {
  it("reads back what was written, with the version stamped", () => {
    expect(writeWizardBackup(backupFor())).toBe(true)

    expect(readWizardBackup("emp-1")).toEqual({ ...backupFor(), version: 2 })
  })

  it("returns null when there is no backup", () => {
    expect(readWizardBackup("emp-1")).toBeNull()
  })

  it("ignores and removes another employer's backup", () => {
    writeWizardBackup(backupFor("emp-2"))

    expect(readWizardBackup("emp-1")).toBeNull()
    expect(window.localStorage.getItem(WIZARD_BACKUP_KEY)).toBeNull()
  })

  it("ignores a backup from before drafts were saved on every step (version 1)", () => {
    window.localStorage.setItem(WIZARD_BACKUP_KEY, JSON.stringify({ ...backupFor(), version: 1 }))

    expect(readWizardBackup("emp-1")).toBeNull()
  })

  it("ignores unreadable JSON and backups of another version", () => {
    window.localStorage.setItem(WIZARD_BACKUP_KEY, "{not json")
    expect(readWizardBackup("emp-1")).toBeNull()

    window.localStorage.setItem(WIZARD_BACKUP_KEY, JSON.stringify({ ...backupFor(), version: 99 }))
    expect(readWizardBackup("emp-1")).toBeNull()
  })

  it("clears the backup", () => {
    writeWizardBackup(backupFor())
    clearWizardBackup()

    expect(readWizardBackup("emp-1")).toBeNull()
  })

  it("doesn't throw when storage is blocked or full", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError")
    })
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError")
    })
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError")
    })

    expect(writeWizardBackup(backupFor())).toBe(false)
    expect(readWizardBackup("emp-1")).toBeNull()
    expect(() => clearWizardBackup()).not.toThrow()
  })
})
