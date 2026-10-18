'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { FILTER_SECTIONS, type FacetFilterKey, type FilterSectionConfig } from './filterConfig'

interface FilterSectionsProps {
  workArrangement: string
  employmentType: string
  experienceLevel: string
  onChange: (key: FacetFilterKey, value: string) => void
  /** Unique prefix so multiple instances (sidebar + drawer) keep separate radio groups. */
  idPrefix: string
}

export function FilterSections({
  workArrangement,
  employmentType,
  experienceLevel,
  onChange,
  idPrefix,
}: FilterSectionsProps) {
  const values: Record<FacetFilterKey, string> = {
    workArrangement,
    employmentType,
    experienceLevel,
  }

  return (
    <div className="divide-y divide-slate-100">
      {FILTER_SECTIONS.map((section) => (
        <CollapsibleGroup
          key={section.key}
          section={section}
          value={values[section.key]}
          onChange={(value) => onChange(section.key, value)}
          idPrefix={idPrefix}
        />
      ))}
    </div>
  )
}

interface CollapsibleGroupProps {
  section: FilterSectionConfig
  value: string
  onChange: (value: string) => void
  idPrefix: string
}

function CollapsibleGroup({ section, value, onChange, idPrefix }: CollapsibleGroupProps) {
  const [open, setOpen] = useState(true)
  const reduceMotion = useReducedMotion()
  const panelId = `${idPrefix}-${section.key}-panel`
  const selectedLabel = section.options.find((option) => option.value === value)?.label

  return (
    <div className="py-4 first:pt-3 last:pb-1">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-2 rounded-md text-left text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>{section.title}</span>
          <span className="flex items-center gap-2">
            {!open && value !== 'all' && (
              <span className="truncate text-xs font-medium text-emerald-700">{selectedLabel}</span>
            )}
            <ChevronDown
              className={`size-4 text-slate-400 transition-transform duration-200 ease-out motion-reduce:transition-none ${
                open ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <fieldset className="mt-2.5 space-y-0.5">
              <legend className="sr-only">{section.title}</legend>
              {section.options.map((option) => {
                const checked = value === option.value
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors duration-150 ease-out hover:bg-slate-50 motion-reduce:transition-none"
                  >
                    <input
                      type="radio"
                      name={`${idPrefix}-${section.key}`}
                      value={option.value}
                      checked={checked}
                      onChange={() => onChange(option.value)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border bg-white transition-colors duration-150 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-1 motion-reduce:transition-none ${
                        checked ? 'border-emerald-600' : 'border-slate-300'
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`size-2 rounded-full bg-emerald-600 transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none ${
                          checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                        }`}
                      />
                    </span>
                    <span className={checked ? 'font-medium text-slate-900' : 'text-slate-600'}>
                      {option.label}
                    </span>
                  </label>
                )
              })}
            </fieldset>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
