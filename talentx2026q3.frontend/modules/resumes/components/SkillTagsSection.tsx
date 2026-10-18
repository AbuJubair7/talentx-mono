'use client'

import React, { useId, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface SkillTagsSectionProps {
  title: string
  items: string[]
  onChange: (updated: string[]) => void
  placeholder?: string
}

export function SkillTagsSection({
  title,
  items,
  onChange,
  placeholder = 'Add a skill',
}: SkillTagsSectionProps) {
  const [inputValue, setInputValue] = useState('')
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const commit = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed])
    }
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && items.length > 0) {
      onChange(items.slice(0, -1))
    }
  }

  const handleRemove = (itemToRemove: string) => {
    onChange(items.filter((item) => item !== itemToRemove))
  }

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          {title}
        </label>
        <span className="text-[11px] font-semibold tabular-nums text-slate-400">{items.length}</span>
      </div>

      <div
        onClick={handleContainerClick}
        className="flex min-h-[46px] cursor-text flex-wrap content-start items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 transition-colors hover:border-slate-300 focus-within:border-slate-900 focus-within:bg-white"
      >
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-1 text-xs font-medium text-slate-700 shadow-xs"
          >
            <span className="min-w-0 break-words">{item}</span>
            <button
              type="button"
              onClick={() => handleRemove(item)}
              aria-label={`Remove ${item}`}
              className="flex size-4 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          </span>
        ))}

        <span className="flex min-w-[8rem] flex-1 items-center gap-1.5">
          <Plus className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            id={inputId}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </span>
      </div>
    </div>
  )
}
