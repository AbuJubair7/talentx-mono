'use client'

import React from 'react'
import { FolderOpen, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectDto } from '../types/resume.types'
import {
  ExtractionDateField,
  ExtractionEmptyState,
  ExtractionField,
  ExtractionSectionHeader,
  ExtractionTextarea,
} from './extraction-ui'

export interface ProjectsSectionProps {
  projects: ProjectDto[]
  onChange: (updated: ProjectDto[]) => void
}

export function ProjectsSection({ projects, onChange }: ProjectsSectionProps) {
  const handleUpdate = (index: number, field: keyof ProjectDto, value: unknown) => {
    const updated = [...projects]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleAdd = () => {
    onChange([
      ...projects,
      {
        projectName: '',
        role: '',
        projectType: 'Professional',
        startDate: '',
        endDate: '',
        isOngoing: false,
        description: '',
        technologiesUsed: [],
        projectUrl: '',
      },
    ])
  }

  const handleOngoingToggle = (index: number, isOngoing: boolean) => {
    const updated = [...projects]
    updated[index] = {
      ...updated[index],
      isOngoing,
      endDate: isOngoing ? '' : updated[index].endDate,
    }
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    onChange(projects.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <section className="space-y-4">
      <ExtractionSectionHeader
        icon={FolderOpen}
        title="Projects"
        description="Notable projects and personal work picked up from your resume."
        count={projects.length}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <ExtractionEmptyState
          icon={FolderOpen}
          message="No projects found"
          hint="Add a project manually if we missed one."
        />
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => {
            const projectName = (project.projectName || '').trim()
            const role = (project.role || '').trim()
            const removeLabel = projectName
              ? role
                ? `Remove ${projectName} (${role})`
                : `Remove ${projectName}`
              : role
                ? `Remove project for ${role}`
                : 'Remove project'

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 sm:p-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ExtractionField
                    label="Project name"
                    value={project.projectName || ''}
                    onChange={(event) => handleUpdate(index, 'projectName', event.target.value)}
                    placeholder="e.g. Distributed Cache System"
                  />
                  <ExtractionField
                    label="Role"
                    value={project.role || ''}
                    onChange={(event) => handleUpdate(index, 'role', event.target.value)}
                    placeholder="e.g. Lead Developer"
                  />
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Project type
                    </span>
                    <select
                      value={project.projectType || 'Professional'}
                      onChange={(event) => handleUpdate(index, 'projectType', event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors duration-150 hover:border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Personal">Personal</option>
                      <option value="Academic">Academic</option>
                    </select>
                  </div>
                  <ExtractionDateField
                    label="Start date"
                    value={project.startDate || ''}
                    onChange={(value) => handleUpdate(index, 'startDate', value)}
                    placeholder="Select start date"
                  />
                  <ExtractionDateField
                    label="End date"
                    value={project.isOngoing ? '' : project.endDate || ''}
                    disabled={project.isOngoing}
                    onChange={(value) => handleUpdate(index, 'endDate', value)}
                    placeholder={project.isOngoing ? 'Present' : 'Select end date'}
                  />
                  <div className="sm:col-span-2">
                    <ExtractionField
                      label="Project URL"
                      type="url"
                      value={project.projectUrl || ''}
                      onChange={(event) => handleUpdate(index, 'projectUrl', event.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <ExtractionTextarea
                      label="Description"
                      rows={3}
                      value={project.description || ''}
                      onChange={(event) => handleUpdate(index, 'description', event.target.value)}
                      placeholder="Describe what you built..."
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={!!project.isOngoing}
                      onChange={(event) => handleOngoingToggle(index, event.target.checked)}
                      className="size-4 rounded border-slate-300 accent-emerald-600"
                    />
                    This project is ongoing
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
