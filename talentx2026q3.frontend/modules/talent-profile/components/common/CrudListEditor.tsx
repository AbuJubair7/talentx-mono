import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import type { CrudListEditorProps } from "../../types"

// Shared list/empty-state/inline-form shell for a talent-profile
// child-entity editor (work experience, education). Callers own only the
// entity-specific bits: how a saved item summarizes itself, its
// accessible edit/delete labels, and the field-specific form it renders
// while editing — the list layout, empty state, and add/edit/delete
// control wiring live here once instead of being duplicated per entity.

export function CrudListEditor<TItem>({
  title,
  addButtonLabel,
  emptyMessage,
  items,
  getItemKey,
  isItemEditing,
  isAddingNew,
  renderSummary,
  getEditAriaLabel,
  getDeleteAriaLabel,
  onStartAdd,
  onStartEdit,
  onDelete,
  renderForm,
}: CrudListEditorProps<TItem>) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <button
          type="button"
          onClick={onStartAdd}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100"
        >
          <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {addButtonLabel}
        </button>
      </div>

      {items.length === 0 && !isAddingNew ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={getItemKey(item)} className="rounded-xl border border-slate-100 bg-white p-4">
            {isItemEditing(item) ? (
              renderForm()
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div>{renderSummary(item)}</div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    aria-label={getEditAriaLabel(item)}
                    onClick={() => onStartEdit(item)}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <PencilIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={getDeleteAriaLabel(item)}
                    onClick={() => onDelete(item)}
                    className="rounded-lg p-1.5 text-rose-500 transition-colors duration-150 hover:bg-rose-50"
                  >
                    <Trash2Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}

        {isAddingNew ? <li className="rounded-xl border border-slate-100 bg-white p-4">{renderForm()}</li> : null}
      </ul>
    </section>
  )
}
