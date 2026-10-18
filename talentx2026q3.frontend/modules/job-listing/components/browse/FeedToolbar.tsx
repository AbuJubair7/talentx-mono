'use client'

import { Bell, LayoutGrid, List, X } from 'lucide-react'
import type { ActivePill } from './filterConfig'

export type FeedView = 'grid' | 'list'

interface FeedToolbarProps {
  total: number
  view: FeedView
  onViewChange: (view: FeedView) => void
  pills: ActivePill[]
  onRemovePill: (key: ActivePill['key']) => void
  onClearAll: () => void
  onCreateAlert: () => void
}

const VIEWS: { value: FeedView; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'grid', label: 'Grid view', icon: LayoutGrid },
  { value: 'list', label: 'Compact list view', icon: List },
]

export function FeedToolbar({
  total,
  view,
  onViewChange,
  pills,
  onRemovePill,
  onClearAll,
  onCreateAlert,
}: FeedToolbarProps) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 id="feed-heading" className="text-lg font-semibold tracking-[-0.015em] text-slate-900">
            Open roles
          </h2>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
            {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {pills.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="rounded px-2 text-sm font-medium text-slate-500 transition-colors duration-150 ease-out hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={onCreateAlert}
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors duration-150 ease-out hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
          >
            <Bell className="size-4 text-slate-500" aria-hidden="true" />
            Create Alert
          </button>
          <div
            role="group"
            aria-label="Layout"
            className="flex rounded-full border border-slate-200 bg-white p-0.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
          >
            {VIEWS.map(({ value, label, icon: Icon }) => {
              const active = view === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={label}
                  aria-pressed={active}
                  onClick={() => onViewChange(value)}
                  className={`flex size-8 items-center justify-center rounded-full transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none ${
                    active ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {pills.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
          {pills.map((pill) => (
            <li key={pill.key}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-3 pr-1 text-xs shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <span className="text-slate-500">{pill.label}:</span>
                <span className="font-medium text-slate-900">{pill.value}</span>
                <button
                  type="button"
                  onClick={() => onRemovePill(pill.key)}
                  aria-label={`Remove ${pill.label} filter: ${pill.value}`}
                  className="flex size-5 items-center justify-center rounded-full text-slate-400 transition-colors duration-150 ease-out hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
                >
                  <X className="size-3" aria-hidden="true" strokeWidth={2.5} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
