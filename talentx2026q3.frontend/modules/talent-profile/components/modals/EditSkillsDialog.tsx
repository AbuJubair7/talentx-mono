"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"

import { SkillsField } from "@/components/common/form/SkillsField"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  SOFT_SKILLS,
  TECHNICAL_SKILLS,
  TOOLS_AND_PLATFORMS,
} from "../../constants/skills-catalog"
import { useUpdateTalentProfile } from "../../hooks/useUpdateTalentProfile"
import type { TalentProfileDto } from "../../types"

export interface EditSkillsDialogProps {
  isOpen: boolean
  onClose: () => void
  profile: TalentProfileDto
}

export function EditSkillsDialog({
  isOpen,
  onClose,
  profile,
}: EditSkillsDialogProps) {
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([...profile.technicalSkills])
  const [softSkills, setSoftSkills] = useState<string[]>([...profile.softSkills])
  const [toolsAndPlatforms, setToolsAndPlatforms] = useState<string[]>([...profile.toolsAndPlatforms])
  const [skillPropositions, setSkillPropositions] = useState<string[]>([
    ...(profile.skillPropositions ?? []),
  ])

  const updateTalentProfileMutation = useUpdateTalentProfile()

  function handleOpenChange(openState: boolean) {
    if (!openState && !updateTalentProfileMutation.isPending) {
      onClose()
    }
  }

  async function handleSave() {
    try {
      await updateTalentProfileMutation.mutateAsync({
        name: profile.name,
        technicalSkills,
        softSkills,
        toolsAndPlatforms,
        skillPropositions,
      })
      onClose()
    } catch {
      // Handled by useUpdateTalentProfile onError notification
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col max-h-[85vh] p-0 overflow-hidden sm:max-w-xl w-full min-w-0 rounded-md">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>Edit Skills</DialogTitle>
          <DialogDescription>
            Add your technical skills, soft skills, and tools &amp; platforms.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-2 flex flex-col gap-5 min-h-0">
          <SkillsField
            label="Technical skills"
            hint="Search the preset list or type your own — Select or press Enter after each one."
            placeholder="e.g. TypeScript, Python, PostgreSQL"
            inputId="modal-technical-skills-input"
            value={technicalSkills}
            onChange={setTechnicalSkills}
            suggestions={TECHNICAL_SKILLS}
          />

          <SkillsField
            label="Soft skills"
            hint="Search the preset list or type your own — Select or press Enter after each one."
            placeholder="e.g. Team Leadership, Communication"
            inputId="modal-soft-skills-input"
            value={softSkills}
            onChange={setSoftSkills}
            suggestions={SOFT_SKILLS}
          />

          <SkillsField
            label="Tools & platforms"
            hint="Search the preset list or type your own — Select or press Enter after each one."
            placeholder="e.g. Docker, AWS, GitHub Actions"
            inputId="modal-tools-and-platforms-input"
            value={toolsAndPlatforms}
            onChange={setToolsAndPlatforms}
            suggestions={TOOLS_AND_PLATFORMS}
          />

          <SkillsField
            label="Skill propositions"
            hint="Short statements that summarize what you bring — press Enter or , after each one."
            placeholder="e.g. Ships production ML pipelines end-to-end"
            inputId="modal-skill-propositions-input"
            value={skillPropositions}
            onChange={setSkillPropositions}
          />
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-end gap-3 z-10 w-full min-w-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateTalentProfileMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateTalentProfileMutation.isPending}
            className="bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700"
          >
            {updateTalentProfileMutation.isPending ? (
              <Loader2Icon aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
