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
import { useEducationMutations } from "../../hooks/useEducationMutations"
import type { EducationItemDto } from "../../types"
import { formatDateSpan } from "../../utils/format-date-span"

export interface EditEducationDialogProps {
  isOpen: boolean
  onClose: () => void
  items: EducationItemDto[]
}

type DialogMode = "list" | "form"

export function EditEducationDialog({
  isOpen,
  onClose,
  items,
}: EditEducationDialogProps) {
  const [mode, setMode] = useState<DialogMode>("list")
  const [editingItem, setEditingItem] = useState<EducationItemDto | null>(null)
  const [deletingItem, setDeletingItem] = useState<EducationItemDto | null>(null)

  const [degree, setDegree] = useState("")
  const [institution, setInstitution] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const { createEducation, updateEducation, deleteEducation } = useEducationMutations()

  const isSaving = createEducation.isPending || updateEducation.isPending

  function resetForm() {
    setDegree("")
    setInstitution("")
    setStartDate("")
    setEndDate("")
    setValidationError(null)
  }

  function handleOpenAddForm() {
    resetForm()
    setEditingItem(null)
    setMode("form")
  }

  function handleOpenEditForm(item: EducationItemDto) {
    setEditingItem(item)
    setDegree(item.degree)
    setInstitution(item.institution)
    setStartDate(item.startDate ?? "")
    setEndDate(item.endDate ?? "")
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
    if (!degree.trim() || !institution.trim()) {
      setValidationError("Degree title and institution are required.")
      return
    }
    if (!startDate.trim()) {
      setValidationError("Start date is required.")
      return
    }

    if (endDate.trim() && isDateBefore(endDate, startDate)) {
      setValidationError("End date cannot be earlier than start date.")
      return
    }

    setValidationError(null)
    const payload = {
      degree: degree.trim(),
      institution: institution.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim() || null,
    }

    try {
      if (editingItem) {
        await updateEducation.mutateAsync({
          id: editingItem.id,
          payload,
        })
      } else {
        await createEducation.mutateAsync(payload)
      }
      resetForm()
      setEditingItem(null)
      setMode("list")
    } catch {
      // Handled by useEducationMutations notification
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return
    try {
      await deleteEducation.mutateAsync(deletingItem.id)
      setDeletingItem(null)
    } catch {
      // Handled by useEducationMutations notification
    }
  }

  function handleOpenChange(openState: boolean) {
    if (!openState && !isSaving && !deleteEducation.isPending) {
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="flex flex-col max-h-[85vh] p-0 overflow-hidden sm:max-w-lg w-full min-w-0 rounded-md">
          <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Degrees and institutions shown on your talent profile.
            </DialogDescription>
          </DialogHeader>

          {mode === "list" ? (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-4 min-h-0">
                {items.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                    No education added yet. Click &quot;+ Add Education&quot; to add your degree.
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
                            {item.degree}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 break-words [overflow-wrap:anywhere]">
                            {item.institution}
                            {item.startDate || item.endDate ? (
                              <span>
                                {" · "}
                                {formatDateSpan(item.startDate, item.endDate)}
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${item.degree} at ${item.institution}`}
                            onClick={() => handleOpenEditForm(item)}
                            className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${item.degree} at ${item.institution}`}
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
                  + Add Education
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
                  <Label htmlFor="edu-degree" className="text-sm font-medium text-slate-700">
                    Degree Title *
                  </Label>
                  <Input
                    id="edu-degree"
                    value={degree}
                    onChange={(event) => setDegree(event.target.value)}
                    placeholder="e.g. Bachelor of Science in Computer Science"
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edu-institution" className="text-sm font-medium text-slate-700">
                    Institution *
                  </Label>
                  <Input
                    id="edu-institution"
                    value={institution}
                    onChange={(event) => setInstitution(event.target.value)}
                    placeholder="e.g. Stanford University"
                    disabled={isSaving}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edu-start-date" className="text-sm font-medium text-slate-700">
                      Start Date *
                    </Label>
                    <MonthYearPicker
                      id="edu-start-date"
                      value={startDate}
                      onChange={(value) => {
                        setStartDate(value)
                        if (endDate && isDateBefore(endDate, value)) {
                          setValidationError("End date cannot be earlier than start date.")
                        } else {
                          setValidationError(null)
                        }
                      }}
                      placeholder="e.g. Sep 2018"
                      disabled={isSaving}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edu-end-date" className="text-sm font-medium text-slate-700">
                      End Date
                    </Label>
                    <MonthYearPicker
                      id="edu-end-date"
                      value={endDate}
                      onChange={(value) => {
                        setEndDate(value)
                        if (value && startDate && isDateBefore(value, startDate)) {
                          setValidationError("End date cannot be earlier than start date.")
                        } else {
                          setValidationError(null)
                        }
                      }}
                      placeholder="e.g. Jun 2022"
                      disabled={isSaving}
                      minDate={startDate}
                    />
                  </div>
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
        title="Delete Education"
        description={
          deletingItem
            ? `Are you sure you want to remove ${deletingItem.degree} at ${deletingItem.institution}?`
            : "Are you sure you want to delete this education entry?"
        }
        isDeleting={deleteEducation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingItem(null)}
      />
    </>
  )
}
