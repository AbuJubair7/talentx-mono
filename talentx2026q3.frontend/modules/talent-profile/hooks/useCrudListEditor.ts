"use client"

import { useState } from "react"
import type { UseCrudListEditorOptions } from "../types"

export function useCrudListEditor<TItem, TFormValues, TPayload>({
  emptyFormValues,
  toFormValues,
  toPayload,
  validate,
  getItemId,
  createMutation,
  updateMutation,
  deleteMutation,
}: UseCrudListEditorOptions<TItem, TFormValues, TPayload>) {
  const [editingId, setEditingId] = useState<string | "new" | null>(null)
  const [formValues, setFormValues] = useState<TFormValues>(emptyFormValues)
  const [formError, setFormError] = useState<string | null>(null)

  function startAdd() {
    setEditingId("new")
    setFormValues(emptyFormValues)
    setFormError(null)
  }

  function startEdit(item: TItem) {
    setEditingId(getItemId(item))
    setFormValues(toFormValues(item))
    setFormError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setFormError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const validationError = validate(formValues)
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = toPayload(formValues)

    try {
      if (editingId === "new") {
        await createMutation.mutateAsync(payload)
      } else if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload })
      }
      setEditingId(null)
    } catch {
      // Failure is already surfaced via the mutation's own onError toast —
      // keep the form open (with its draft values) so the user can retry.
    }
  }

  function handleDelete(item: TItem) {
    deleteMutation.mutate(getItemId(item))
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return {
    editingId,
    formValues,
    setFormValues,
    formError,
    isSaving,
    startAdd,
    startEdit,
    cancelEdit,
    handleSubmit,
    handleDelete,
    isEditingItem: (item: TItem) => editingId === getItemId(item),
    isAddingNew: editingId === "new",
  }
}
