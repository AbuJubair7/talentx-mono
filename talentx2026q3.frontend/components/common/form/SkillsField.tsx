"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PlusIcon, XIcon } from "lucide-react"

import { FieldWrapper, fieldDescribedBy } from "./FieldWrapper"
import { ENTRANCE_EASE, fieldInputClass } from "./field-styles"

interface SkillsFieldProps {
  value: string[]
  onChange: (skills: string[]) => void
  error?: string
  label?: string
  hint?: string
  placeholder?: string
  inputId?: string
  suggestions?: string[]
}

// Generic tag-array input, promoted out of modules/jobposting so it can back
// any comma/Enter-separated list field (skills, URLs, value propositions).
// Callers that need domain-specific copy or suggestions pass them as props;
// modules/jobposting/components/SkillsField.tsx wraps this with its original
// defaults so its own call sites needed no changes.
export function SkillsField({
  value,
  onChange,
  error,
  label = "Tags",
  hint = "Press Enter after each entry to add it.",
  placeholder = "Type a value…",
  inputId = "skills-field-input",
  suggestions = [],
}: SkillsFieldProps) {
  const [draft, setDraft] = useState("")
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  function addEntry(raw: string) {
    const entry = raw.trim()
    if (!entry) return
    if (value.some((existing) => existing.toLowerCase() === entry.toLowerCase())) {
      setDraft("")
      return
    }
    onChange([...value, entry])
    setDraft("")
  }

  function removeEntry(entry: string) {
    onChange(value.filter((existing) => existing !== entry))
  }

  const remainingSuggestions = suggestions.filter(
    (suggestion) => !value.some((entry) => entry.toLowerCase() === suggestion.toLowerCase())
  )

  // Searchable picker: typing filters the catalog, an empty query browses
  // the whole list. Matches render as a horizontal scrollable chip strip
  // inside a fixed-height window so the surrounding layout never shifts.
  // Selecting adds immediately and keeps focus for rapid multi-add;
  // anything not in the catalog can be added as custom.
  const searchQuery = draft.trim().toLowerCase()
  const matchedSuggestions = searchQuery
    ? remainingSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(searchQuery)
      )
    : remainingSuggestions
  const trimmedDraft = draft.trim()
  const canAddCustom =
    trimmedDraft.length > 0 &&
    !value.some((entry) => entry.toLowerCase() === trimmedDraft.toLowerCase())

  const listboxId = `${inputId}-suggestions`

  return (
    <FieldWrapper label={label} htmlFor={inputId} hint={hint} error={error}>
      <div className="relative">
        <input
          id={inputId}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setIsPickerOpen(true)
          }}
          onFocus={() => {
            if (remainingSuggestions.length > 0) setIsPickerOpen(true)
          }}
          onBlur={() => setIsPickerOpen(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              addEntry(draft)
            }
            if (event.key === "Escape") {
              setIsPickerOpen(false)
            }
            if (event.key === "Backspace" && !draft && value.length) {
              removeEntry(value[value.length - 1])
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby={fieldDescribedBy(inputId, !!error, !!hint)}
          aria-expanded={remainingSuggestions.length > 0 ? isPickerOpen : undefined}
          aria-controls={remainingSuggestions.length > 0 ? listboxId : undefined}
          role={remainingSuggestions.length > 0 ? "combobox" : undefined}
          aria-autocomplete={remainingSuggestions.length > 0 ? "list" : undefined}
          className={fieldInputClass}
        />

        {remainingSuggestions.length > 0 && isPickerOpen ? (
          <div
            id={listboxId}
            role="listbox"
            aria-label={`${label} suggestions`}
            className="absolute inset-x-0 top-full z-10 mt-1 flex h-56 flex-col rounded-md border border-slate-200 bg-white shadow-md"
          >
            {matchedSuggestions.length > 0 ? (
              <p className="shrink-0 px-3 pb-1 pt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {searchQuery
                  ? `${matchedSuggestions.length} match${matchedSuggestions.length === 1 ? "" : "es"} — click to add`
                  : `${matchedSuggestions.length} skills — scroll & click to add`}
              </p>
            ) : null}
            {matchedSuggestions.length > 0 ? (
              <div className="flex min-h-0 flex-1 flex-wrap content-start gap-1.5 overflow-y-auto px-3 py-1 [scrollbar-width:thin]">
                {matchedSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    role="option"
                    aria-selected="false"
                    // Prevent blur so the click registers and focus stays
                    // in the input for rapid multi-add.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => addEntry(suggestion)}
                    className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <PlusIcon aria-hidden="true" className="h-3 w-3 shrink-0" />
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-[13px] italic text-slate-400">
                No preset skills match &ldquo;{trimmedDraft}&rdquo;.
              </p>
            )}
            {canAddCustom ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addEntry(trimmedDraft)}
                className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-1.5 text-left text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <PlusIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                Add &ldquo;{trimmedDraft}&rdquo; as custom
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-slate-500">
        Press{" "}
        <kbd className="rounded border border-slate-300 bg-slate-100 px-1 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
          Enter
        </kbd>{" "}
       
        after each entry to add it.
      </p>

      {value.length > 0 ? (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          <AnimatePresence initial={false}>
            {value.map((entry) => (
              <motion.li
                key={entry}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.16, ease: ENTRANCE_EASE }}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600"
              >
                {entry}
                <button
                  type="button"
                  onClick={() => removeEntry(entry)}
                  aria-label={`Remove ${entry}`}
                  className="text-emerald-600/70 transition-colors duration-150 hover:text-emerald-600"
                >
                  <XIcon aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : null}

      {remainingSuggestions.length > 0 ? (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
            Suggested
          </span>
          {remainingSuggestions.slice(0, 4).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addEntry(suggestion)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              <PlusIcon aria-hidden="true" className="h-3 w-3" />
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </FieldWrapper>
  )
}
