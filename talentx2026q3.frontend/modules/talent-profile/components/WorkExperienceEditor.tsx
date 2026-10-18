"use client"

import { useState } from "react"

import { FieldWrapper, fieldDescribedBy } from "@/components/common/form/FieldWrapper"
import { fieldInputClass } from "@/components/common/form/field-styles"
import { MonthYearPicker } from "@/components/common/MonthYearPicker"
import { isDateBefore } from "@/components/ui/MonthYearPicker"

import { CrudListEditor } from "./common/CrudListEditor"
import { DeleteConfirmationDialog } from "./common/DeleteConfirmationDialog"
import { useCrudListEditor } from "../hooks/useCrudListEditor"
import { useWorkExperienceMutations } from "../hooks/useWorkExperienceMutations"
import type {
  WorkExperienceEditorProps,
  WorkExperienceFormProps,
  WorkExperienceFormValues,
  WorkExperienceItemDto,
  WorkExperienceUpsertPayload,
} from "../types"

const emptyFormValues: WorkExperienceFormValues = {
  companyName: "",
  jobTitle: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
}

function toFormValues(item: WorkExperienceItemDto): WorkExperienceFormValues {
  return {
    companyName: item.companyName,
    jobTitle: item.jobTitle,
    startDate: item.startDate ?? "",
    endDate: item.endDate ?? "",
    isCurrent: item.isCurrent,
  }
}

function toUpsertPayload(formValues: WorkExperienceFormValues): WorkExperienceUpsertPayload {
  return {
    companyName: formValues.companyName.trim(),
    jobTitle: formValues.jobTitle.trim(),
    startDate: formValues.startDate.trim() || null,
    endDate: formValues.isCurrent ? null : formValues.endDate.trim() || null,
    isCurrent: formValues.isCurrent,
  }
}

function validate(formValues: WorkExperienceFormValues): string | null {
  if (!formValues.companyName.trim() || !formValues.jobTitle.trim()) {
    return "Company name and job title are required."
  }
  if (
    !formValues.isCurrent &&
    formValues.endDate.trim() &&
    isDateBefore(formValues.endDate, formValues.startDate)
  ) {
    return "End date cannot be earlier than start date."
  }
  return null
}

export function WorkExperienceEditor({ items, workExperiences }: WorkExperienceEditorProps) {
  const resolvedItems = items ?? workExperiences ?? []
  const { createWorkExperience, updateWorkExperience, deleteWorkExperience } = useWorkExperienceMutations()
  const [itemToDelete, setItemToDelete] = useState<WorkExperienceItemDto | null>(null)

  const editor = useCrudListEditor<WorkExperienceItemDto, WorkExperienceFormValues, WorkExperienceUpsertPayload>({
    emptyFormValues,
    toFormValues,
    toPayload: toUpsertPayload,
    validate,
    getItemId: (item) => item.id,
    createMutation: createWorkExperience,
    updateMutation: updateWorkExperience,
    deleteMutation: deleteWorkExperience,
  })

  function handleConfirmDelete() {
    if (!itemToDelete) return
    deleteWorkExperience.mutate(itemToDelete.id, {
      onSettled: () => setItemToDelete(null),
    })
  }

  return (
    <>
      <CrudListEditor<WorkExperienceItemDto>
        title="Work experience"
        addButtonLabel="Add"
        emptyMessage="No work experience added yet."
        items={resolvedItems}
        getItemKey={(item) => item.id}
        isItemEditing={editor.isEditingItem}
        isAddingNew={editor.isAddingNew}
        onStartAdd={editor.startAdd}
        onStartEdit={editor.startEdit}
        onDelete={(item) => setItemToDelete(item)}
        getEditAriaLabel={(item) => `Edit ${item.jobTitle} at ${item.companyName}`}
        getDeleteAriaLabel={(item) => `Delete ${item.jobTitle} at ${item.companyName}`}
        renderSummary={(item) => (
          <>
            <p className="text-sm font-semibold text-slate-900">
              {item.jobTitle} · {item.companyName}
              {item.isCurrent ? (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  Current
                </span>
              ) : null}
            </p>
            <p className="text-xs text-slate-500">
              {item.startDate ?? "—"} – {item.isCurrent ? "Present" : item.endDate ?? "—"}
            </p>
          </>
        )}
        renderForm={() => (
          <WorkExperienceForm
            formValues={editor.formValues}
            setFormValues={editor.setFormValues}
            error={editor.formError}
            isSaving={editor.isSaving}
            onSubmit={editor.handleSubmit}
            onCancel={editor.cancelEdit}
          />
        )}
      />

      <DeleteConfirmationDialog
        isOpen={Boolean(itemToDelete)}
        title="Delete work experience"
        description={
          itemToDelete
            ? `Are you sure you want to delete ${itemToDelete.jobTitle} at ${itemToDelete.companyName}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isDeleting={deleteWorkExperience.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </>
  )
}

function WorkExperienceForm({ formValues, setFormValues, error, isSaving, onSubmit, onCancel }: WorkExperienceFormProps) {
  const hasRequiredFieldError = Boolean(error)

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldWrapper
          label="Job title"
          htmlFor="workExperienceJobTitle"
          error={hasRequiredFieldError ? error ?? undefined : undefined}
        >
          <input
            id="workExperienceJobTitle"
            className={fieldInputClass}
            aria-invalid={hasRequiredFieldError}
            aria-describedby={fieldDescribedBy("workExperienceJobTitle", hasRequiredFieldError, false)}
            value={formValues.jobTitle}
            onChange={(event) => setFormValues((previous) => ({ ...previous, jobTitle: event.target.value }))}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Company name"
          htmlFor="workExperienceCompanyName"
          error={hasRequiredFieldError ? error ?? undefined : undefined}
        >
          <input
            id="workExperienceCompanyName"
            className={fieldInputClass}
            aria-invalid={hasRequiredFieldError}
            aria-describedby={fieldDescribedBy("workExperienceCompanyName", hasRequiredFieldError, false)}
            value={formValues.companyName}
            onChange={(event) => setFormValues((previous) => ({ ...previous, companyName: event.target.value }))}
          />
        </FieldWrapper>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldWrapper label="Start date" htmlFor="workExperienceStartDate">
          <MonthYearPicker
            id="workExperienceStartDate"
            value={formValues.startDate}
            onChange={(value) => setFormValues((previous) => ({ ...previous, startDate: value }))}
            placeholder="Select start date"
          />
        </FieldWrapper>
        <FieldWrapper
          label="End date"
          htmlFor="workExperienceEndDate"
          hint={formValues.isCurrent ? "Cleared while marked current" : undefined}
        >
          <MonthYearPicker
            id="workExperienceEndDate"
            value={formValues.isCurrent ? "" : formValues.endDate}
            disabled={formValues.isCurrent}
            minDate={formValues.startDate}
            onChange={(value) => setFormValues((previous) => ({ ...previous, endDate: value }))}
            placeholder={formValues.isCurrent ? "Present" : "Select end date"}
          />
        </FieldWrapper>
      </div>

      <label className="inline-flex w-fit items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={formValues.isCurrent}
          onChange={(event) => setFormValues((previous) => ({ ...previous, isCurrent: event.target.checked }))}
          className="h-4 w-4 rounded border-slate-300"
        />
        I currently work here
      </label>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  )
}
