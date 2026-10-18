'use client'

import React, { useRef, useState } from 'react'
import { Globe, Plus, X } from 'lucide-react'

import { cn } from '@/lib/utils'

import { extractionInputClass } from './extraction-ui'

interface PortfolioLinksEditorProps {
  urls: string[]
  onChange: (urls: string[]) => void
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function PortfolioLinksEditor({ urls, onChange }: PortfolioLinksEditorProps) {
  const [touched, setTouched] = useState<boolean[]>([])
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const updateAt = (index: number, value: string) => {
    const next = [...urls]
    next[index] = value
    onChange(next)
  }

  const handleBlur = (index: number) => {
    setTouched((prev) => {
      const next = [...prev]
      next[index] = true
      return next
    })

    const current = urls[index] ?? ''
    const trimmed = current.trim()
    if (trimmed !== current) {
      updateAt(index, trimmed)
    }
  }

  const removeAt = (index: number) => {
    onChange(urls.filter((_, i) => i !== index))
    setTouched((prev) => prev.filter((_, i) => i !== index))
    inputRefs.current.splice(index, 1)
  }

  const addRow = (afterIndex?: number) => {
    const insertAt = afterIndex === undefined ? urls.length : afterIndex + 1
    const next = [...urls]
    next.splice(insertAt, 0, '')
    onChange(next)
    setTouched((prev) => {
      const copy = [...prev]
      copy.splice(insertAt, 0, false)
      return copy
    })
    requestAnimationFrame(() => inputRefs.current[insertAt]?.focus())
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addRow(index)
    } else if (event.key === 'Backspace' && !urls[index] && urls.length > 1) {
      event.preventDefault()
      removeAt(index)
      const focusIndex = Math.max(0, index - 1)
      requestAnimationFrame(() => inputRefs.current[focusIndex]?.focus())
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-600">Portfolio URLs</span>

      {urls.length === 0 ? (
        <p className="text-xs text-slate-400">No portfolio links yet.</p>
      ) : (
        <div className="space-y-2">
          {urls.map((url, index) => {
            const invalid = (touched[index] ?? false) && url.trim() !== '' && !isValidUrl(url.trim())

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex-1">
                    <Globe
                      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      ref={(element) => {
                        inputRefs.current[index] = element
                      }}
                      type="url"
                      value={url}
                      onChange={(event) => updateAt(index, event.target.value)}
                      onBlur={() => handleBlur(index)}
                      onKeyDown={(event) => handleKeyDown(event, index)}
                      placeholder="https://your-portfolio.com"
                      aria-label={`Portfolio URL ${index + 1}`}
                      aria-invalid={invalid}
                      className={cn(extractionInputClass, 'pl-10 pr-3.5')}
                    />
                  </span>

                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    aria-label={`Remove portfolio URL ${index + 1}`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>

                {invalid ? (
                  <p className="pl-1 text-xs font-medium text-rose-600">
                    Enter a valid URL (http:// or https://).
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => addRow()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Add link
      </button>
    </div>
  )
}
