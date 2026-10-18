"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { isDateBefore, MonthYearPicker } from "@/components/ui/MonthYearPicker"
import { PROJECT_LIMITS, PROJECT_TYPE_OPTIONS } from "../../constants/project.constants"
import { useProjectMutations } from "../../hooks/useProjectMutations"
import type { ProjectItemDto, ProjectType, ProjectUpsertPayload } from "../../types/talent-profile.types"

export interface EditProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  projectToEdit?: ProjectItemDto | null
}

export function EditProjectDialog({
  isOpen,
  onClose,
  projectToEdit,
}: EditProjectDialogProps) {
  const [prevProjectToEdit, setPrevProjectToEdit] = useState(projectToEdit)
  const [projectName, setProjectName] = useState(projectToEdit?.projectName ?? "")
  const [role, setRole] = useState(projectToEdit?.role ?? "")
  const [projectType, setProjectType] = useState<ProjectType>(projectToEdit?.projectType ?? "Professional")
  const [startDate, setStartDate] = useState(projectToEdit?.startDate ?? "")
  const [endDate, setEndDate] = useState(projectToEdit?.endDate ?? "")
  const [isOngoing, setIsOngoing] = useState(projectToEdit?.isOngoing ?? false)
  const [description, setDescription] = useState(projectToEdit?.description ?? "")
  const [technologiesUsed, setTechnologiesUsed] = useState<string[]>(projectToEdit?.technologiesUsed ?? [])
  const [techInput, setTechInput] = useState("")
  const [projectUrl, setProjectUrl] = useState(projectToEdit?.projectUrl ?? "")
  const [validationError, setValidationError] = useState<string | null>(null)

  if (projectToEdit !== prevProjectToEdit) {
    setPrevProjectToEdit(projectToEdit)
    setProjectName(projectToEdit?.projectName ?? "")
    setRole(projectToEdit?.role ?? "")
    setProjectType(projectToEdit?.projectType ?? "Professional")
    setStartDate(projectToEdit?.startDate ?? "")
    setEndDate(projectToEdit?.endDate ?? "")
    setIsOngoing(projectToEdit?.isOngoing ?? false)
    setDescription(projectToEdit?.description ?? "")
    setTechnologiesUsed(projectToEdit?.technologiesUsed ?? [])
    setProjectUrl(projectToEdit?.projectUrl ?? "")
    setTechInput("")
    setValidationError(null)
  }

  const { createProject, updateProject } = useProjectMutations()
  const isSaving = createProject.isPending || updateProject.isPending

  function handleOngoingToggle(checked: boolean) {
    setIsOngoing(checked)
    if (checked) {
      setEndDate("")
    }
  }

  function handleAddTech() {
    const trimmedTechnology = techInput.trim()
    if (!trimmedTechnology) {
      setTechInput("")
      return
    }
    if (technologiesUsed.length >= PROJECT_LIMITS.MAX_TECHNOLOGIES_COUNT) {
      setValidationError(`You can specify up to ${PROJECT_LIMITS.MAX_TECHNOLOGIES_COUNT} technologies.`)
      return
    }
    if (!technologiesUsed.includes(trimmedTechnology)) {
      setTechnologiesUsed([...technologiesUsed, trimmedTechnology])
    }
    setTechInput("")
  }

  function handleTechKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      handleAddTech()
    }
  }

  function handleRemoveTech(technologyToRemove: string) {
    setTechnologiesUsed(technologiesUsed.filter((item) => item !== technologyToRemove))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!projectName.trim()) {
      setValidationError("Project name is required.")
      return
    }
    if (projectName.length > PROJECT_LIMITS.MAX_PROJECT_NAME_LENGTH) {
      setValidationError(`Project name must not exceed ${PROJECT_LIMITS.MAX_PROJECT_NAME_LENGTH} characters.`)
      return
    }
    if (!role.trim()) {
      setValidationError("Role is required.")
      return
    }
    if (role.length > PROJECT_LIMITS.MAX_ROLE_LENGTH) {
      setValidationError(`Role must not exceed ${PROJECT_LIMITS.MAX_ROLE_LENGTH} characters.`)
      return
    }
    if (!startDate.trim()) {
      setValidationError("Start date is required.")
      return
    }
    if (!isOngoing && endDate.trim() && isDateBefore(endDate, startDate)) {
      setValidationError("End date cannot be earlier than start date.")
      return
    }
    if (!description.trim()) {
      setValidationError("Description is required.")
      return
    }
    if (description.length > PROJECT_LIMITS.MAX_DESCRIPTION_LENGTH) {
      setValidationError(`Description must not exceed ${PROJECT_LIMITS.MAX_DESCRIPTION_LENGTH} characters.`)
      return
    }
    if (projectUrl.trim()) {
      if (projectUrl.length > PROJECT_LIMITS.MAX_PROJECT_URL_LENGTH) {
        setValidationError(`Project URL must not exceed ${PROJECT_LIMITS.MAX_PROJECT_URL_LENGTH} characters.`)
        return
      }
      try {
        const parsedUrl = new URL(projectUrl.trim())
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          setValidationError("Project URL must start with http:// or https://")
          return
        }
      } catch {
        setValidationError("Please enter a valid URL.")
        return
      }
    }

    setValidationError(null)

    const payload: ProjectUpsertPayload = {
      projectName: projectName.trim(),
      role: role.trim(),
      projectType,
      startDate: startDate.trim(),
      endDate: isOngoing ? null : endDate.trim() || null,
      isOngoing,
      description: description.trim(),
      technologiesUsed,
      projectUrl: projectUrl.trim() || null,
    }

    try {
      if (projectToEdit) {
        await updateProject.mutateAsync({ id: projectToEdit.id, payload })
      } else {
        await createProject.mutateAsync(payload)
      }
      onClose()
    } catch {
      // Handled by useProjectMutations notification
    }
  }

  function handleOpenChange(openState: boolean) {
    if (!openState && !isSaving) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-md p-6 break-words sm:max-w-2xl">
        <form noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogTitle className="tracking-tight font-header text-base font-semibold text-ink">
              {projectToEdit ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogDescription className="text-sm text-ink-muted">
              Notable projects from your experience shown on your talent passport.
            </DialogDescription>
          </div>

          <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
            {/* Project Name */}
            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-ink" htmlFor="project-name">
                  Project Name<span className="text-destructive text-rose-500"> *</span>
                </label>
                <Input
                  id="project-name"
                  placeholder="e.g., MedNexus"
                  name="project_name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  maxLength={PROJECT_LIMITS.MAX_PROJECT_NAME_LENGTH}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-ink" htmlFor="project-role">
                Role<span className="text-destructive text-rose-500"> *</span>
              </label>
              <Input
                id="project-role"
                placeholder="e.g., Full-Stack Developer"
                name="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                maxLength={PROJECT_LIMITS.MAX_ROLE_LENGTH}
              />
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-ink" htmlFor="project-type">
                Project Type<span className="text-destructive text-rose-500"> *</span>
              </label>
              <div className="relative">
                <select
                  id="project-type"
                  value={projectType}
                  onChange={(event) => setProjectType(event.target.value as ProjectType)}
                  className="flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-600 focus:ring-0 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-0"
                >
                  {PROJECT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 opacity-50" />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-ink" htmlFor="project-start">
                Start Date <span className="text-destructive text-rose-500">*</span>
              </label>
              <MonthYearPicker
                id="project-start"
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-ink" htmlFor="project-end">
                End Date
              </label>
              <MonthYearPicker
                id="project-end"
                value={endDate}
                onChange={setEndDate}
                placeholder={isOngoing ? "Present" : "Select end date"}
                disabled={isOngoing}
              />
            </div>

            {/* Ongoing Checkbox */}
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="project-ongoing"
                checked={isOngoing}
                onChange={(event) => handleOngoingToggle(event.target.checked)}
                className="h-4 w-4 rounded-sm border border-slate-300 text-emerald-700 accent-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              />
              <label className="text-sm font-normal text-ink-muted cursor-pointer" htmlFor="project-ongoing">
                This project is ongoing
              </label>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-ink" htmlFor="project-description">
                  Description<span className="text-destructive text-rose-500"> *</span>
                </label>
                <Textarea
                  id="project-description"
                  rows={3}
                  placeholder="What the project does and what you built"
                  name="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={PROJECT_LIMITS.MAX_DESCRIPTION_LENGTH}
                />
              </div>
            </div>

            {/* Technologies Used with dedicated Add button and tag chips */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none text-ink" htmlFor="project-technologies">
                Technologies Used
              </label>
              <div className="flex gap-2">
                <Input
                  id="project-technologies"
                  placeholder="e.g., React — press Enter to add"
                  value={techInput}
                  onChange={(event) => setTechInput(event.target.value)}
                  onKeyDown={handleTechKeyDown}
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-[#E1E4EA] bg-white text-[#0E121B] hover:bg-[#F5F7FA] px-4 py-2 h-10 shrink-0 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                >
                  Add
                </button>
              </div>
              {technologiesUsed.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {technologiesUsed.map((technology) => (
                    <span
                      key={technology}
                      className="inline-flex h-[26px] items-center gap-1 rounded-md bg-slate-100 px-2.5 text-xs leading-[14px] text-slate-700"
                    >
                      {technology}
                      <button
                        type="button"
                        aria-label={`Remove ${technology}`}
                        onClick={() => handleRemoveTech(technology)}
                        className="text-slate-400 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Project URL */}
            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-ink" htmlFor="project-url">
                  Project URL
                </label>
                <Input
                  id="project-url"
                  placeholder="e.g., https://github.com/you/project"
                  name="project_url"
                  value={projectUrl}
                  onChange={(event) => setProjectUrl(event.target.value)}
                  maxLength={PROJECT_LIMITS.MAX_PROJECT_URL_LENGTH}
                />
              </div>
            </div>
          </div>

          {validationError ? (
            <p role="alert" className="text-sm font-medium text-rose-600">
              {validationError}
            </p>
          ) : null}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-[#E1E4EA] bg-white text-[#0E121B] hover:bg-[#F5F7FA] px-4 py-2 h-9 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium px-4 py-2 h-9 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              {isSaving ? "Saving..." : projectToEdit ? "Update Project" : "Add Project"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
