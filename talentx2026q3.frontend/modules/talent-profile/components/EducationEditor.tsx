"use client"

import { useState } from "react"

import { FieldWrapper, fieldDescribedBy } from "@/components/common/form/FieldWrapper"
import { fieldInputClass } from "@/components/common/form/field-styles"
import { MonthYearPicker } from "@/components/common/MonthYearPicker"
import { isDateBefore } from "@/components/ui/MonthYearPicker"

import { CrudListEditor } from "./common/CrudListEditor"
import { DeleteConfirmationDialog } from "./common/DeleteConfirmationDialog"
import { useCrudListEditor } from "../hooks/useCrudListEditor"
import { useEducationMutations } from "../hooks/useEducationMutations"
import type {
  EducationEditorProps,
  EducationFormProps,
  EducationFormValues,
  EducationItemDto,
  EducationUpsertPayload,
} from "../types"

const emptyFormValues: EducationFormValues = {
  institution: "",
  degree: "",
  startDate: "",
  endDate: "",
}

function toFormValues(item: EducationItemDto): EducationFormValues {
  return {
    institution: item.institution,
    degree: item.degree,
    startDate: item.startDate ?? "",
    endDate: item.endDate ?? "",
  }
}

function toUpsertPayload(formValues: EducationFormValues): EducationUpsertPayload {
  return {
    institution: formValues.institution.trim(),
    degree: formValues.degree.trim(),
    startDate: formValues.startDate.trim() || null,
    endDate: formValues.endDate.trim() || null,
  }
}

function validate(formValues: EducationFormValues): string | null {
  if (!formValues.institution.trim() || !formValues.degree.trim()) {
    return "Institution and degree are required."
  }
  if (
    formValues.endDate.trim() &&
    isDateBefore(formValues.endDate, formValues.startDate)
  ) {
    return "End date cannot be earlier than start date."
  }
  return null
}

export function EducationEditor({ items, educations }: EducationEditorProps) {
  const resolvedItems = items ?? educations ?? []
  const { createEducation, updateEducation, deleteEducation } = useEducationMutations()
  const [itemToDelete, setItemToDelete] = useState<EducationItemDto | null>(null)

  const editor = useCrudListEditor<EducationItemDto, EducationFormValues, EducationUpsertPayload>({
    emptyFormValues,
    toFormValues,
    toPayload: toUpsertPayload,
    validate,
    getItemId: (item) => item.id,
    createMutation: createEducation,
    updateMutation: updateEducation,
    deleteMutation: deleteEducation,
  })

  function handleConfirmDelete() {
    if (!itemToDelete) return
    deleteEducation.mutate(itemToDelete.id, {
      onSettled: () => setItemToDelete(null),
    })
  }

  return (
    <>
      <CrudListEditor<EducationItemDto>
        title="Education"
        addButtonLabel="Add"
        emptyMessage="No education added yet."
        items={resolvedItems}
        getItemKey={(item) => item.id}
        isItemEditing={editor.isEditingItem}
        isAddingNew={editor.isAddingNew}
        onStartAdd={editor.startAdd}
        onStartEdit={editor.startEdit}
        onDelete={(item) => setItemToDelete(item)}
        getEditAriaLabel={(item) => `Edit ${item.degree} at ${item.institution}`}
        getDeleteAriaLabel={(item) => `Delete ${item.degree} at ${item.institution}`}
        renderSummary={(item) => (
          <>
            <p className="text-sm font-semibold text-slate-900">
              {item.degree} · {item.institution}
            </p>
            <p className="text-xs text-slate-500">
              {item.startDate ?? "—"} – {item.endDate ?? "—"}
            </p>
          </>
        )}
        renderForm={() => (
          <EducationForm
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
        title="Delete education"
        description={
          itemToDelete
            ? `Are you sure you want to delete ${itemToDelete.degree} at ${itemToDelete.institution}? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isDeleting={deleteEducation.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />
    </>
  )
}

function EducationForm({ formValues, setFormValues, error, isSaving, onSubmit, onCancel }: EducationFormProps) {
  const hasRequiredFieldError = Boolean(error)

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldWrapper
          label="Degree"
          htmlFor="educationDegree"
          error={hasRequiredFieldError ? error ?? undefined : undefined}
        >
          <input
            id="educationDegree"
            className={fieldInputClass}
            aria-invalid={hasRequiredFieldError}
            aria-describedby={fieldDescribedBy("educationDegree", hasRequiredFieldError, false)}
            value={formValues.degree}
            onChange={(event) => setFormValues((previous) => ({ ...previous, degree: event.target.value }))}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Institution"
          htmlFor="educationInstitution"
          error={hasRequiredFieldError ? error ?? undefined : undefined}
        >
          <input
            id="educationInstitution"
            className={fieldInputClass}
            aria-invalid={hasRequiredFieldError}
            aria-describedby={fieldDescribedBy("educationInstitution", hasRequiredFieldError, false)}
            value={formValues.institution}
            onChange={(event) => setFormValues((previous) => ({ ...previous, institution: event.target.value }))}
          />
        </FieldWrapper>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FieldWrapper label="Start date" htmlFor="educationStartDate">
          <MonthYearPicker
            id="educationStartDate"
            value={formValues.startDate}
            onChange={(value) => setFormValues((previous) => ({ ...previous, startDate: value }))}
            placeholder="Select start date"
          />
        </FieldWrapper>
        <FieldWrapper label="End date / Expected" htmlFor="educationEndDate">
          <MonthYearPicker
            id="educationEndDate"
            value={formValues.endDate}
            minDate={formValues.startDate}
            onChange={(value) => setFormValues((previous) => ({ ...previous, endDate: value }))}
            placeholder="Select end date"
          />
        </FieldWrapper>
      </div>

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
