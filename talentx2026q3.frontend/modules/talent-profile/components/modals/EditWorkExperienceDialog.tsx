"use client"

import { useState } from "react"
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isDateBefore, MonthYearPicker } from "@/components/ui/MonthYearPicker"
import { DeleteConfirmationDialog } from "../common/DeleteConfirmationDialog"
import { useWorkExperienceMutations } from "../../hooks/useWorkExperienceMutations"
import type { WorkExperienceItemDto } from "../../types"
import { formatDateSpan } from "../../utils/format-date-span"

export interface EditWorkExperienceDialogProps {
  isOpen: boolean
  onClose: () => void
  items: WorkExperienceItemDto[]
}

type DialogMode = "list" | "form"

export function EditWorkExperienceDialog({
  isOpen,
  onClose,
  items,
}: EditWorkExperienceDialogProps) {
  const [mode, setMode] = useState<DialogMode>("list")
  const [editingItem, setEditingItem] = useState<WorkExperienceItemDto | null>(null)
  const [deletingItem, setDeletingItem] = useState<WorkExperienceItemDto | null>(null)

  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isCurrent, setIsCurrent] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { createWorkExperience, updateWorkExperience, deleteWorkExperience } =
    useWorkExperienceMutations()

  const isSaving = createWorkExperience.isPending || updateWorkExperience.isPending

  function resetForm() {
    setJobTitle("")
    setCompanyName("")
    setStartDate("")
    setEndDate("")
    setIsCurrent(false)
    setValidationError(null)
  }

  function handleOpenAddForm() {
    resetForm()
    setEditingItem(null)
    setMode("form")
  }

  function handleOpenEditForm(item: WorkExperienceItemDto) {
    setEditingItem(item)
    setJobTitle(item.jobTitle)
    setCompanyName(item.companyName)
    setStartDate(item.startDate ?? "")
    setEndDate(item.endDate ?? "")
    setIsCurrent(item.isCurrent)
    setValidationError(null)
    setMode("form")
  }

  function handleCancelForm() {
    resetForm()
    setEditingItem(null)
    setMode("list")
  }

  async function handleSaveForm(event: React.FormEvent) {
    event.preventDefault()
    if (!jobTitle.trim() || !companyName.trim()) {
      setValidationError("Job title and company name are required.")
      return
    }
    if (!startDate.trim()) {
      setValidationError("Start date is required.")
      return
    }

    if (!isCurrent && endDate.trim() && isDateBefore(endDate, startDate)) {
      setValidationError("End date cannot be earlier than start date.")
      return
    }

    setValidationError(null)
    const payload = {
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim(),
      startDate: startDate.trim(),
      endDate: isCurrent ? null : endDate.trim() || null,
      isCurrent,
    }

    try {
      if (editingItem) {
        await updateWorkExperience.mutateAsync({
          id: editingItem.id,
          payload,
        })
      } else {
        await createWorkExperience.mutateAsync(payload)
      }
      resetForm()
      setEditingItem(null)
      setMode("list")
    } catch {
      // Handled by useWorkExperienceMutations notification
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return
    try {
      await deleteWorkExperience.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Handled by useWorkExperienceMutations notification
    }
  }

  function handleOpenChange(openState: boolean) {
    if (!openState && !isSaving && !deleteWorkExperience.isPending) {
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="flex flex-col max-h-[85vh] p-0 overflow-hidden sm:max-w-xl w-full min-w-0 rounded-md">
          <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>
              Roles and responsibilities shown on your talent profile.
            </DialogDescription>
          </DialogHeader>

          {mode === "list" ? (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-4 min-h-0">
                {items.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    No work experience added yet. Click &quot;+ Add Experience&quot; to add your first role.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-slate-100 rounded-md border border-slate-200 min-w-0 w-full overflow-hidden">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors min-w-0 w-full gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-slate-900 break-words [overflow-wrap:anywhere] leading-snug">
                            {item.jobTitle}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 break-words [overflow-wrap:anywhere]">
                            {item.companyName}
                            {item.startDate || item.endDate || item.isCurrent ? (
                              <span>
                                {" · "}
                                {formatDateSpan(item.startDate, item.endDate, item.isCurrent)}
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${item.jobTitle} at ${item.companyName}`}
                            onClick={() => handleOpenEditForm(item)}
                            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${item.jobTitle} at ${item.companyName}`}
                            onClick={() => setDeletingItem(item)}
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between z-10 w-full min-w-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenAddForm}
                  className="font-medium"
                >
                  + Add Experience
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  className="bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveForm} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-4 min-h-0">
                {validationError ? (
                  <div role="alert" className="rounded-md bg-rose-50 p-2.5 text-xs text-rose-700">
                    {validationError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="work-job-title" className="text-sm font-medium text-slate-700">
                    Job Title *
                  </Label>
                  <Input
                    id="work-job-title"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="work-company-name" className="text-sm font-medium text-slate-700">
                    Company *
                  </Label>
                  <Input
                    id="work-company-name"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="e.g. Acme Technologies"
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="work-start-date" className="text-sm font-medium text-slate-700">
                      Start Date *
                    </Label>
                    <MonthYearPicker
                      id="work-start-date"
                      value={startDate}
                      onChange={(value) => {
                        setStartDate(value)
                        if (!isCurrent && endDate && isDateBefore(endDate, value)) {
                          setValidationError("End date cannot be earlier than start date.")
                        } else {
                          setValidationError(null)
                        }
                      }}
                      placeholder="e.g. Jan 2022"
                      disabled={isSaving}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="work-end-date" className="text-sm font-medium text-slate-700">
                      End Date
                    </Label>
                    <MonthYearPicker
                      id="work-end-date"
                      value={isCurrent ? "" : endDate}
                      onChange={(value) => {
                        setEndDate(value)
                        if (value && startDate && isDateBefore(value, startDate)) {
                          setValidationError("End date cannot be earlier than start date.")
                        } else {
                          setValidationError(null)
                        }
                      }}
                      placeholder={isCurrent ? "Present" : "e.g. Dec 2023"}
                      disabled={isSaving || isCurrent}
                      minDate={startDate}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="work-is-current"
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(event) => {
                      setIsCurrent(event.target.checked)
                      if (event.target.checked) {
                        setEndDate("")
                        setValidationError(null)
                      }
                    }}
                    disabled={isSaving}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                  />
                  <Label htmlFor="work-is-current" className="text-sm text-slate-700 cursor-pointer">
                    I currently work here
                  </Label>
                </div>
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-end gap-3 z-10 w-full min-w-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700"
                >
                  {isSaving ? (
                    <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={Boolean(deletingItem)}
        title="Delete Work Experience"
        description={
          deletingItem
            ? `Are you sure you want to remove ${deletingItem.jobTitle} at ${deletingItem.companyName}?`
            : "Are you sure you want to delete this work experience?"
        }
        isDeleting={deleteWorkExperience.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingItem(null)}
      />
    </>
  )
}
