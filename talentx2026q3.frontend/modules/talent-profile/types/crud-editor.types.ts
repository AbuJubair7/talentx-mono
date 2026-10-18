import type { ReactNode } from "react"
import type { UseMutationResult } from "@tanstack/react-query"

export interface TalentProfileChildService<TPayload> {
  create: (payload: TPayload) => Promise<unknown>
  update: (id: string, payload: TPayload) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
}

export interface UseCrudListEditorOptions<TItem, TFormValues, TPayload> {
  emptyFormValues: TFormValues
  toFormValues: (item: TItem) => TFormValues
  toPayload: (formValues: TFormValues) => TPayload
  validate: (formValues: TFormValues) => string | null
  getItemId: (item: TItem) => string
  createMutation: UseMutationResult<unknown, unknown, TPayload>
  updateMutation: UseMutationResult<unknown, unknown, { id: string; payload: TPayload }>
  deleteMutation: UseMutationResult<unknown, unknown, string>
}

export interface CrudListEditorProps<TItem> {
  title: string
  addButtonLabel: string
  emptyMessage: string
  items: TItem[]
  getItemKey: (item: TItem) => string
  isItemEditing: (item: TItem) => boolean
  isAddingNew: boolean
  renderSummary: (item: TItem) => ReactNode
  getEditAriaLabel: (item: TItem) => string
  getDeleteAriaLabel: (item: TItem) => string
  onStartAdd: () => void
  onStartEdit: (item: TItem) => void
  onDelete: (item: TItem) => void
  renderForm: () => ReactNode
}

export interface DeleteConfirmationDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  isDeleting?: boolean
  onConfirm: () => void
  onClose: () => void
}
