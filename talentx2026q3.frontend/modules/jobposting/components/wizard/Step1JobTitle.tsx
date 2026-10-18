"use client"

import { useEffect } from "react"
import { useJobWizardStore } from "../../store/job-wizard-store"
import { useCurrentEmployer } from "../../hooks/useCurrentEmployer"
import { FieldWrapper } from "../FieldWrapper"
import { fieldInputClass } from "../../utils/field-styles"

export function Step1JobTitle() {
  const { formData, updateFormData, fieldErrors } = useJobWizardStore()
  const { data: currentEmployer } = useCurrentEmployer()

  useEffect(() => {
    if (!currentEmployer?.companyName) return
    if (formData.companyName) return
    updateFormData({ companyName: currentEmployer.companyName })
  }, [currentEmployer, formData.companyName, updateFormData])

  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
  }

  const companyNameReadOnly = !!currentEmployer?.companyName

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Job Title & Company</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter the job title for this position. Company name is taken from your profile.
      </p>

      <div className="mt-6 space-y-5">
        <FieldWrapper
          label="Job Title"
          htmlFor="title"
          required
          error={fieldErrors.title}
        >
          <input
            id="title"
            placeholder="e.g. Senior Backend Engineer"
            className={`${fieldInputClass} ${fieldErrors.title ? "border-red-400 focus:border-red-400 focus:ring-0" : ""}`}
            value={formData.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </FieldWrapper>

        <FieldWrapper
          label="Company Name"
          htmlFor="companyName"
          error={fieldErrors.companyName}
          hint={companyNameReadOnly ? "Auto-filled from your profile" : undefined}
        >
          <input
            id="companyName"
            placeholder="e.g. TalentX"
            readOnly={companyNameReadOnly}
            className={`${fieldInputClass} ${companyNameReadOnly ? "cursor-not-allowed bg-slate-50 text-slate-600" : ""} ${fieldErrors.companyName ? "border-red-400 focus:border-red-400 focus:ring-0" : ""}`}
            value={formData.companyName || ""}
            onChange={(e) => handleChange("companyName", e.target.value)}
          />
        </FieldWrapper>
      </div>
    </div>
  )
}
