"use client"

import { useJobWizardStore } from "../../store/job-wizard-store"
import { useGenerateSkills } from "../../hooks/useGenerateSkills"
import { SkillsField } from "../SkillsField"
import { AIGenerateButton } from "../AIGenerateButton"
import { AIGeneratedNote } from "../AIGeneratedNote"

export function Step4Skills() {
  const { formData, updateFormData, fieldErrors, aiGenerated, markAiGenerated } = useJobWizardStore()
  const generateSkills = useGenerateSkills()

  const handleChange = (skills: string[]) => {
    updateFormData({ requiredSkills: skills })
  }

  const handleGenerateSkills = () => {
    generateSkills.mutate(
      {
        title: formData.title || "",
        companyName: formData.companyName || "",
        employmentType: formData.employmentType || "FullTime",
        experienceLevel: formData.experienceLevel || "MidLevel",
        workArrangement: formData.workArrangement || "OnSite",
      },
      {
        onSuccess: (data) => {
          updateFormData({ requiredSkills: data.skills })
          markAiGenerated("skills")
        },
      }
    )
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 transition-all duration-200 hover:border-slate-500 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Required Skills</h2>
          <p className="mt-1 text-sm text-slate-500">
            List the skills required for this role. Use Generate Skills for AI suggestions — you can
            edit them.
          </p>
        </div>
        <AIGenerateButton
          onClick={handleGenerateSkills}
          isLoading={generateSkills.isPending}
          label={aiGenerated.skills ? "Regenerate Skills" : "Generate Skills"}
        />
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-700 mb-2">
          Skills <span className="text-red-500">*</span>
        </p>
        <SkillsField
          value={formData.requiredSkills || []}
          onChange={handleChange}
        />
        {fieldErrors.requiredSkills && (
          <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.requiredSkills}</p>
        )}
        {(!formData.requiredSkills || formData.requiredSkills.length === 0) && !fieldErrors.requiredSkills && (
          <p className="mt-1 text-xs text-slate-500">Add at least one skill</p>
        )}
        {aiGenerated.skills && (
          <AIGeneratedNote>
            AI-generated. Add or remove skills freely, or click Regenerate Skills for a new set.
          </AIGeneratedNote>
        )}
      </div>
    </div>
  )
}
