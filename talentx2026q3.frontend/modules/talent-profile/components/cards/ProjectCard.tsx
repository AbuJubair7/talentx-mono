"use client"

import { ExternalLink, Pencil, Trash2 } from "lucide-react"

import type { ProjectItemDto } from "../../types/talent-profile.types"
import { formatDateSpan } from "../../utils/format-date-span"

export interface ProjectCardProps {
  project: ProjectItemDto
  onEdit: (project: ProjectItemDto) => void
  onDelete: (project: ProjectItemDto) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const dateRangeText = formatDateSpan(project.startDate, project.endDate, project.isOngoing)

  return (
    <article className="rounded-md border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 break-words">
          <p className="font-header text-lg font-semibold leading-[22px] text-slate-900 break-words">
            {project.projectName}
          </p>
          <p className="mt-1 text-sm leading-[17px] text-slate-500 break-words">
            {project.role} · {project.projectType}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {dateRangeText ? (
            <span className="text-sm leading-[17px] text-slate-500">{dateRangeText}</span>
          ) : null}
          <div className="passport-no-print flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(project)}
              aria-label={`Edit ${project.projectName}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(project)}
              aria-label={`Delete ${project.projectName}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {project.description ? (
        <p className="mt-3 text-sm leading-5 text-slate-600 break-words whitespace-pre-wrap">
          {project.description}
        </p>
      ) : null}

      {project.technologiesUsed && project.technologiesUsed.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {project.technologiesUsed.map((technology) => (
            <span
              key={technology}
              className="inline-flex h-[22px] items-center rounded-md bg-slate-100 px-2.5 text-xs font-medium leading-[14px] text-slate-700 break-all"
            >
              {technology}
            </span>
          ))}
        </div>
      ) : null}

      {project.projectUrl ? (
        <a
          href={project.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-sm"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span>View project</span>
        </a>
      ) : null}
    </article>
  )
}
