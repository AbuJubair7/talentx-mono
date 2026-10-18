'use client'

import { useState } from 'react'
import {
  Briefcase,
  GraduationCap,
  Globe,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_ARRANGEMENTS,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_ARRANGEMENT_LABELS,
} from '@/types/job'
import type { EmploymentType, ExperienceLevel, WorkArrangement, JobFilterParams } from '@/types/job'

interface JobFilterSidebarProps {
  filters: JobFilterParams
  onEmploymentTypeChange: (value: EmploymentType | '') => void
  onExperienceLevelChange: (value: ExperienceLevel | '') => void
  onWorkArrangementChange: (value: WorkArrangement | '') => void
  onClearAll: () => void
  hasActiveFilters: boolean
  className?: string
}

export function JobFilterSidebar({
  filters,
  onEmploymentTypeChange,
  onExperienceLevelChange,
  onWorkArrangementChange,
  onClearAll,
  hasActiveFilters,
  className = '',
}: JobFilterSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Count active facet filters in the sidebar
  const activeCount = [
    filters.employmentType,
    filters.experienceLevel,
    filters.workArrangement,
  ].filter(Boolean).length

  return (
    <aside className={`space-y-4.5 ${className}`}>
      {/* Main Filter Card */}
      <div className="bg-white rounded-md border border-slate-200/90 p-4.5 sm:p-5 shadow-xs">
        {/* Header: Filters + Count + Reset */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Filters</h3>
            {activeCount > 0 && (
              <span className="size-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              Reset all
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {/* Work Arrangement / Work Mode */}
          <div className="py-4 space-y-2.5">
            <button
              type="button"
              onClick={() => toggleSection('workMode')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="size-3.5 text-slate-400" />
                Work Mode
              </span>
              {collapsedSections.workMode ? (
                <ChevronDown className="size-3.5 text-slate-400" />
              ) : (
                <ChevronUp className="size-3.5 text-slate-400" />
              )}
            </button>

            {!collapsedSections.workMode && (
              <div className="space-y-1 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="workArrangement"
                    checked={!filters.workArrangement}
                    onChange={() => onWorkArrangementChange('')}
                    className="accent-emerald-600 size-3.5"
                  />
                  <span>All Modes</span>
                </label>
                {WORK_ARRANGEMENTS.map((mode) => {
                  const isChecked = filters.workArrangement === mode
                  return (
                    <label
                      key={mode}
                      className={`flex items-center justify-between text-xs font-medium cursor-pointer p-2 rounded-xl transition-colors ${isChecked
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="workArrangement"
                          checked={isChecked}
                          onChange={() => onWorkArrangementChange(mode)}
                          className="accent-emerald-600 size-3.5"
                        />
                        <span>{WORK_ARRANGEMENT_LABELS[mode]}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Employment Type */}
          <div className="py-4 space-y-2.5">
            <button
              type="button"
              onClick={() => toggleSection('jobType')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Briefcase className="size-3.5 text-slate-400" />
                Employment Type
              </span>
              {collapsedSections.jobType ? (
                <ChevronDown className="size-3.5 text-slate-400" />
              ) : (
                <ChevronUp className="size-3.5 text-slate-400" />
              )}
            </button>

            {!collapsedSections.jobType && (
              <div className="space-y-1 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="employmentType"
                    checked={!filters.employmentType}
                    onChange={() => onEmploymentTypeChange('')}
                    className="accent-emerald-600 size-3.5"
                  />
                  <span>All Types</span>
                </label>
                {EMPLOYMENT_TYPES.map((type) => {
                  const isChecked = filters.employmentType === type
                  return (
                    <label
                      key={type}
                      className={`flex items-center justify-between text-xs font-medium cursor-pointer p-2 rounded-xl transition-colors ${isChecked
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="employmentType"
                          checked={isChecked}
                          onChange={() => onEmploymentTypeChange(type)}
                          className="accent-emerald-600 size-3.5"
                        />
                        <span>{EMPLOYMENT_TYPE_LABELS[type]}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Experience Level */}
          <div className="py-4 space-y-2.5">
            <button
              type="button"
              onClick={() => toggleSection('expLevel')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-slate-400" />
                Experience Level
              </span>
              {collapsedSections.expLevel ? (
                <ChevronDown className="size-3.5 text-slate-400" />
              ) : (
                <ChevronUp className="size-3.5 text-slate-400" />
              )}
            </button>

            {!collapsedSections.expLevel && (
              <div className="space-y-1 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="experienceLevel"
                    checked={!filters.experienceLevel}
                    onChange={() => onExperienceLevelChange('')}
                    className="accent-emerald-600 size-3.5"
                  />
                  <span>All Levels</span>
                </label>
                {EXPERIENCE_LEVELS.map((level) => {
                  const isChecked = filters.experienceLevel === level
                  return (
                    <label
                      key={level}
                      className={`flex items-center justify-between text-xs font-medium cursor-pointer p-2 rounded-xl transition-colors ${isChecked
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="experienceLevel"
                          checked={isChecked}
                          onChange={() => onExperienceLevelChange(level)}
                          className="accent-emerald-600 size-3.5"
                        />
                        <span>{EXPERIENCE_LEVEL_LABELS[level]}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
