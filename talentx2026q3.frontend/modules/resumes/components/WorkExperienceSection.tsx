'use client'

import React from 'react'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkExperienceDto } from '../types/resume.types'
import { ExtractionDateField, ExtractionEmptyState, ExtractionField, ExtractionSectionHeader } from './extraction-ui'

interface WorkExperienceSectionProps {
  experiences: WorkExperienceDto[]
  onChange: (updated: WorkExperienceDto[]) => void
}

export function WorkExperienceSection({ experiences, onChange }: WorkExperienceSectionProps) {
  const handleUpdate = (index: number, field: keyof WorkExperienceDto, value: string) => {
    const updated = [...experiences]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleAdd = () => {
    onChange([
      ...experiences,
      { companyName: '', jobTitle: '', startDate: '', endDate: '', isCurrent: false },
    ])
  }

  const handleCurrentToggle = (index: number, isCurrent: boolean) => {
    const updated = [...experiences]
    updated[index] = { ...updated[index], isCurrent, endDate: isCurrent ? '' : updated[index].endDate }
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index))
  }

  return (
    <section className="space-y-4">
      <ExtractionSectionHeader
        icon={Briefcase}
        title="Work experience"
        description="Roles and companies we picked up from your resume."
        count={experiences.length}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add role
          </Button>
        }
      />

      {experiences.length === 0 ? (
        <ExtractionEmptyState
          icon={Briefcase}
          message="No work experience found"
          hint="Add a role manually if we missed one."
        />
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, index) => {
            const jobTitle = (exp.jobTitle || '').trim()
            const company = (exp.companyName || '').trim()
            const removeLabel = jobTitle
              ? company
                ? `Remove ${jobTitle} at ${company}`
                : `Remove ${jobTitle}`
              : company
                ? `Remove role at ${company}`
                : 'Remove work experience'

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 sm:p-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ExtractionField
                    label="Job title"
                    value={exp.jobTitle || ''}
                    onChange={(e) => handleUpdate(index, 'jobTitle', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                  />
                  <ExtractionField
                    label="Company"
                    value={exp.companyName || ''}
                    onChange={(e) => handleUpdate(index, 'companyName', e.target.value)}
                    placeholder="e.g. Acme Corp"
                  />
                  <ExtractionDateField
                    label="Start date"
                    value={exp.startDate || ''}
                    onChange={(value) => handleUpdate(index, 'startDate', value)}
                    placeholder="Select start date"
                  />
                  <ExtractionDateField
                    label="End date"
                    value={exp.isCurrent ? '' : exp.endDate || ''}
                    disabled={exp.isCurrent}
                    onChange={(value) => handleUpdate(index, 'endDate', value)}
                    placeholder={exp.isCurrent ? 'Present' : 'Select end date'}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={!!exp.isCurrent}
                      onChange={(e) => handleCurrentToggle(index, e.target.checked)}
                      className="size-4 rounded border-slate-300 accent-emerald-600"
                    />
                    I currently work here
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(index)}
                    aria-label={removeLabel}
                    className="text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
