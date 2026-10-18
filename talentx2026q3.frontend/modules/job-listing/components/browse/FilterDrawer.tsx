'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useDialog } from '../../hooks/useDialog'
import { FilterSections } from './FilterSections'
import type { FacetFilterKey } from './filterConfig'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  workArrangement: string
  employmentType: string
  experienceLevel: string
  total: number
  activeCount: number
  onChange: (key: FacetFilterKey, value: string) => void
  onReset: () => void
}

export function FilterDrawer({
  open,
  onClose,
  workArrangement,
  employmentType,
  experienceLevel,
  total,
  activeCount,
  onChange,
  onReset,
}: FilterDrawerProps) {
  useDialog(open, onClose)
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-filters-heading"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
            initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
              <h2 id="drawer-filters-heading" className="text-[15px] font-semibold text-slate-900">
                Filters
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                autoFocus
                className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <FilterSections
                workArrangement={workArrangement}
                employmentType={employmentType}
                experienceLevel={experienceLevel}
                onChange={onChange}
                idPrefix="drawer"
              />
            </div>
            <div className="flex gap-3 border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={onReset}
                disabled={activeCount === 0}
                className="h-11 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors duration-150 ease-out hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:text-slate-300 motion-reduce:transition-none"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-11 flex-1 rounded-full bg-emerald-600 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 motion-reduce:transition-none"
              >
                View {total} {total === 1 ? 'job' : 'jobs'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
