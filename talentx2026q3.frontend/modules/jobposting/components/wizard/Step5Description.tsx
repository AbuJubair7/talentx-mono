"use client"

import { FileTextIcon, ListChecksIcon } from "lucide-react"
import { useJobWizardStore } from "../../store/job-wizard-store"
import { useGenerateDescription } from "../../hooks/useGenerateDescription"
import { useGenerateRequirements } from "../../hooks/useGenerateRequirements"
import { FieldWrapper } from "../FieldWrapper"
import { fieldInputClass } from "../../utils/field-styles"
import { AIGenerateButton } from "../AIGenerateButton"
import { AIGeneratedNote } from "../AIGeneratedNote"

const DESCRIPTION_LIMIT = 10000
const REQUIREMENTS_LIMIT = 5000

export function Step5Description() {
  const { formData, updateFormData, fieldErrors, aiGenerated, markAiGenerated } = useJobWizardStore()
  const generateDescription = useGenerateDescription()
  const generateRequirements = useGenerateRequirements()

  const handleChange = (value: string) => {
    updateFormData({ description: value })
  }

  const handleRequirementsChange = (value: string) => {
    updateFormData({ requirements: value })
  }

  const handleGenerateDescription = () => {
    generateDescription.mutate(
      {
        title: formData.title || "",
        companyName: formData.companyName || "",
        employmentType: formData.employmentType || "FullTime",
        experienceLevel: formData.experienceLevel || "MidLevel",
        workArrangement: formData.workArrangement || "OnSite",
        requiredSkills: formData.requiredSkills,
      },
      {
        onSuccess: (data) => {
          updateFormData({ description: data.description })
          markAiGenerated("description")
        },
      }
    )
  }

  const handleGenerateRequirements = () => {
    generateRequirements.mutate(
      {
        title: formData.title || "",
        companyName: formData.companyName || "",
        employmentType: formData.employmentType || "FullTime",
        experienceLevel: formData.experienceLevel || "MidLevel",
        workArrangement: formData.workArrangement || "OnSite",
        requiredSkills: formData.requiredSkills,
      },
      {
        onSuccess: (data) => {
          updateFormData({ requirements: data.requirements })
          markAiGenerated("requirements")
        },
      }
    )
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 transition-all duration-200 hover:border-slate-500 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Job Description</h2>
          <p className="mt-1 text-sm text-slate-500">
            Describe the role, responsibilities, and requirements. Use Generate Description for an
            AI draft — you can edit it.
          </p>
        </div>
        <AIGenerateButton
          onClick={handleGenerateDescription}
          isLoading={generateDescription.isPending}
          label={aiGenerated.description ? "Regenerate Description" : "Generate Description"}
        />
      </div>

      <div className="mt-6">
        <FieldWrapper
          label="Description"
          htmlFor="description"
          required
          error={fieldErrors.description}
          trailing={
            <span className="font-mono text-xs font-bold text-slate-500">
              {(formData.description ?? "").length} / {DESCRIPTION_LIMIT}
            </span>
          }
        >
          <div className="relative">
            <FileTextIcon className="pointer-events-none absolute left-3 top-3 z-10 h-4 w-4 text-slate-400" />
            <textarea
              id="description"
              rows={12}
              maxLength={DESCRIPTION_LIMIT}
              placeholder="Describe the role, responsibilities, and requirements."
              className={`${fieldInputClass} pl-11 ${fieldErrors.description ? "border-red-300 focus:border-red-400 focus:ring-0" : ""}`}
              value={formData.description || ""}
              onChange={(e) => handleChange(e.target.value)}
            />
          </div>
        </FieldWrapper>
        <p className="mt-1 text-xs text-slate-500">Minimum 20 characters</p>
        {aiGenerated.description && (
          <AIGeneratedNote>
            AI-generated. Edit the text freely, or click Regenerate Description for a new draft.
          </AIGeneratedNote>
        )}
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Requirements</h2>
            <p className="mt-1 text-sm text-slate-500">
              Years of experience, education, and language proficiency — shown to candidates as a
              bullet-point list. Use Generate Requirements for an AI draft — you can edit it.
            </p>
          </div>
          <AIGenerateButton
            onClick={handleGenerateRequirements}
            isLoading={generateRequirements.isPending}
            label={aiGenerated.requirements ? "Regenerate Requirements" : "Generate Requirements"}
          />
        </div>

        <div className="mt-6">
          <FieldWrapper
            label="Requirements"
            htmlFor="requirements"
            required
            error={fieldErrors.requirements}
            trailing={
              <span className="font-mono text-xs font-bold text-slate-500">
                {(formData.requirements ?? "").length} / {REQUIREMENTS_LIMIT}
              </span>
            }
          >
            <div className="relative">
              <ListChecksIcon className="pointer-events-none absolute left-3 top-3 z-10 h-4 w-4 text-slate-400" />
              <textarea
                id="requirements"
                rows={8}
                maxLength={REQUIREMENTS_LIMIT}
                placeholder="- 3-5 years of relevant experience&#10;- Bachelor's degree or equivalent&#10;- Fluent written and spoken English"
                className={`${fieldInputClass} pl-11 ${fieldErrors.requirements ? "border-red-300 focus:border-red-400 focus:ring-0" : ""}`}
                value={formData.requirements || ""}
                onChange={(e) => handleRequirementsChange(e.target.value)}
              />
            </div>
          </FieldWrapper>
          <p className="mt-1 text-xs text-slate-500">Minimum 15 characters</p>
          {aiGenerated.requirements && (
            <AIGeneratedNote>
              AI-generated. Edit the list freely, or click Regenerate Requirements for a new draft.
            </AIGeneratedNote>
          )}
        </div>
      </div>
    </div>
  )
}
