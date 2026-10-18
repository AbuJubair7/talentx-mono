"use client"

import { useState } from "react"
import { FolderOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProjectMutations } from "../../hooks/useProjectMutations"
import type { ProjectItemDto } from "../../types/talent-profile.types"
import { ProjectCard } from "../cards/ProjectCard"
import { DeleteConfirmationDialog } from "../common/DeleteConfirmationDialog"
import { EditProjectDialog } from "../modals/EditProjectDialog"
import { SectionEmptyState } from "../SectionEmptyState"

export interface ProjectsTabContentProps {
  projects: ProjectItemDto[]
}

export function ProjectsTabContent({ projects }: ProjectsTabContentProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<ProjectItemDto | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<ProjectItemDto | null>(null)

  const { deleteProject } = useProjectMutations()

  function handleOpenAdd() {
    setProjectToEdit(null)
    setIsEditorOpen(true)
  }

  function handleOpenEdit(project: ProjectItemDto) {
    setProjectToEdit(project)
    setIsEditorOpen(true)
  }

  function handleCloseEditor() {
    setIsEditorOpen(false)
    setProjectToEdit(null)
  }

  function handleConfirmDelete() {
    if (!projectToDelete) return
    deleteProject.mutate(projectToDelete.id, {
      onSuccess: () => {
        setProjectToDelete(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <FolderOpen className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Projects</h2>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {projects.length}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              A collection of notable projects from your experience.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 self-start sm:self-auto"
        >
          + Add Project
        </Button>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-xs">
          <SectionEmptyState
            icon={FolderOpen}
            title="No projects added yet."
            description="Showcase your best work by adding notable projects to your profile."
          />
          <div className="-mt-2 flex justify-center pb-6">
            <Button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              + Add Project
            </Button>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectCard
                project={project}
                onEdit={handleOpenEdit}
                onDelete={(item) => setProjectToDelete(item)}
              />
            </li>
          ))}
        </ul>
      )}

      {isEditorOpen ? (
        <EditProjectDialog
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          projectToEdit={projectToEdit}
        />
      ) : null}

      {projectToDelete ? (
        <DeleteConfirmationDialog
          isOpen={Boolean(projectToDelete)}
          title="Delete Project"
          description={`Are you sure you want to delete "${projectToDelete.projectName}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isDeleting={deleteProject.isPending}
          onConfirm={handleConfirmDelete}
          onClose={() => setProjectToDelete(null)}
        />
      ) : null}
    </div>
  )
}
