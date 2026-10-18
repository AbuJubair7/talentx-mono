'use client'

import React from 'react'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EducationDto } from '../types/resume.types'
import { ExtractionDateField, ExtractionEmptyState, ExtractionField, ExtractionSectionHeader } from './extraction-ui'

interface EducationSectionProps {
  education: EducationDto[]
  onChange: (updated: EducationDto[]) => void
}

export function EducationSection({ education, onChange }: EducationSectionProps) {
  const handleUpdate = (index: number, field: keyof EducationDto, value: string) => {
    const updated = [...education]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleAdd = () => {
    onChange([
      ...education,
      { institution: '', degree: '', startDate: '', endDate: '' },
    ])
  }

  const handleRemove = (index: number) => {
    onChange(education.filter((_, i) => i !== index))
  }

  return (
    <section className="space-y-4">
      <ExtractionSectionHeader
        icon={GraduationCap}
        title="Education"
        description="Degrees and institutions listed on your resume."
        count={education.length}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add education
          </Button>
        }
      />

      {education.length === 0 ? (
        <ExtractionEmptyState
          icon={GraduationCap}
          message="No education history found"
          hint="Add a degree manually if we missed one."
        />
      ) : (
        <div className="space-y-3">
          {education.map((edu, index) => {
            const degree = (edu.degree || '').trim()
            const institution = (edu.institution || '').trim()
            const removeLabel = degree
              ? institution
                ? `Remove ${degree} at ${institution}`
                : `Remove ${degree}`
              : institution
                ? `Remove education at ${institution}`
                : 'Remove education'

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 sm:p-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ExtractionField
                    label="Degree"
                    value={edu.degree || ''}
                    onChange={(e) => handleUpdate(index, 'degree', e.target.value)}
                    placeholder="e.g. B.S. in Computer Science"
                  />
                  <ExtractionField
                    label="Institution"
                    value={edu.institution || ''}
                    onChange={(e) => handleUpdate(index, 'institution', e.target.value)}
                    placeholder="e.g. Stanford University"
                  />
                  <ExtractionDateField
                    label="Start date"
                    value={edu.startDate || ''}
                    onChange={(value) => handleUpdate(index, 'startDate', value)}
                    placeholder="Select start date"
                  />
                  <ExtractionDateField
                    label="End date"
                    value={edu.endDate || ''}
                    onChange={(value) => handleUpdate(index, 'endDate', value)}
                    placeholder="Select end date"
                  />
                </div>

                <div className="mt-4 flex justify-end">
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
