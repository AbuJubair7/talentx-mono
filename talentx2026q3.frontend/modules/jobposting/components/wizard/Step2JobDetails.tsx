"use client"

import { useEffect, useRef } from "react"
import type { KeyboardEvent } from "react"

import { BriefcaseIcon, DollarSignIcon, TrendingUpIcon, UsersIcon } from "lucide-react"
import { useJobWizardStore } from "../../store/job-wizard-store"
import {
  CURRENCY_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  SALARY_PERIOD_OPTIONS,
  SALARY_TYPE_OPTIONS,
} from "../../utils/job-options"
import { SelectField } from "../SelectField"
import { FieldWrapper } from "../FieldWrapper"
import { fieldInputClass } from "../../utils/field-styles"
import { DatePickerField } from "@/components/common/DatePickerField"

// Native number inputs still accept e/E (scientific notation) and +/-, even with min={0}; block them so
// a salary amount can only ever contain digits and a decimal point.
function blockNonNumericKey(keyboardEvent: KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-"].includes(keyboardEvent.key)) {
    keyboardEvent.preventDefault()
  }
}

export function Step2JobDetails() {
  const { formData, updateFormData, fieldErrors, clearFieldErrors } = useJobWizardStore()

  const handleChange = (field: string, value: string | number | undefined) => {
    updateFormData({ [field]: value })
  }

  const today = new Date().toISOString().split("T")[0]

  const salaryType = formData.salaryType
  const needsAmounts = salaryType === "Fixed" || salaryType === "Range"
  const amountsEnabled = !!formData.salaryCurrency && !!formData.salaryPeriod

  const prevSalaryTypeRef = useRef(salaryType)
  useEffect(() => {
    if (prevSalaryTypeRef.current !== salaryType) {
      prevSalaryTypeRef.current = salaryType
      clearFieldErrors()
    }
  }, [salaryType])

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 transition-all duration-200 hover:border-slate-500 hover:shadow-md">
      <h2 className="text-lg font-semibold text-slate-900">Employment Details</h2>
      <p className="mt-1 text-sm text-slate-500">
        Specify the employment type, experience level, vacancies, and expiration for this role.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <SelectField
          id="employmentType"
          label="Employment Type"
          value={formData.employmentType || "FullTime"}
          options={EMPLOYMENT_TYPE_OPTIONS}
          onChange={(value) => handleChange("employmentType", value)}
          required
          icon={BriefcaseIcon}
          error={fieldErrors.employmentType}
        />

        <SelectField
          id="experienceLevel"
          label="Experience Level"
          value={formData.experienceLevel || "MidLevel"}
          options={EXPERIENCE_LEVEL_OPTIONS}
          onChange={(value) => handleChange("experienceLevel", value)}
          required
          icon={TrendingUpIcon}
          error={fieldErrors.experienceLevel}
        />

        <FieldWrapper
          label="Vacancies"
          htmlFor="vacancies"
          required
          error={fieldErrors.vacancies}
        >
          <div className="relative">
            <UsersIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="vacancies"
              type="number"
              min={1}
              placeholder="1"
              className={`${fieldInputClass} pl-11 ${fieldErrors.vacancies ? "border-red-300 focus:border-red-400 focus:ring-0" : ""}`}
              value={formData.vacancies || ""}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === "") {
                  handleChange("vacancies", 0)
                } else {
                  const parsed = parseInt(raw)
                  if (!isNaN(parsed)) {
                    handleChange("vacancies", parsed)
                  }
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              onBlur={() => {
                if (!formData.vacancies || formData.vacancies < 1) {
                  handleChange("vacancies", 1)
                }
              }}
            />
          </div>
        </FieldWrapper>

        <FieldWrapper
          label="Expire Date"
          htmlFor="expireAt"
          required
          error={fieldErrors.expireAt}
        >
          <DatePickerField
            id="expireAt"
            value={formData.expireAt || ""}
            onChange={(value) => handleChange("expireAt", value)}
            min={today}
            error={fieldErrors.expireAt}
          />
        </FieldWrapper>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="mb-4 text-sm font-semibold text-slate-700">Salary</p>

        <SelectField
          id="salaryType"
          label="Salary Type"
          value={salaryType}
          options={SALARY_TYPE_OPTIONS}
          onChange={(value) => {
            if (value === "Negotiable") {
              updateFormData({
                salaryType: value,
                salaryCurrency: undefined,
                salaryPeriod: undefined,
                salaryMin: undefined,
                salaryMax: undefined,
              })
            } else if (value === "Fixed") {
              updateFormData({
                salaryType: value,
                salaryMax: undefined,
              })
            } else {
              handleChange("salaryType", value)
            }
          }}
          required
          icon={DollarSignIcon}
          error={fieldErrors.salaryType}
        />

        {needsAmounts && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <SelectField
              id="salaryCurrency"
              label="Currency"
              value={formData.salaryCurrency}
              options={CURRENCY_OPTIONS}
              onChange={(value) => handleChange("salaryCurrency", value)}
              required
              error={fieldErrors.salaryCurrency}
            />

            <SelectField
              id="salaryPeriod"
              label="Period"
              value={formData.salaryPeriod}
              options={SALARY_PERIOD_OPTIONS}
              onChange={(value) => handleChange("salaryPeriod", value)}
              required
              error={fieldErrors.salaryPeriod}
            />

            {salaryType === "Fixed" ? (
              <FieldWrapper
                label="Amount"
                htmlFor="salaryMin"
                required
                error={fieldErrors.salaryMin}
              >
                <div className="relative">
                  <input
                    id="salaryMin"
                    type="number"
                    min={0}
                    disabled={!amountsEnabled}
                    placeholder="e.g. 80000"
                    className={`${fieldInputClass} disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.salaryMin ? "border-red-300 focus:border-red-400 focus:ring-0" : ""}`}
                    value={formData.salaryMin ?? ""}
                    onChange={(e) => handleChange("salaryMin", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                    onKeyDown={blockNonNumericKey}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
              </FieldWrapper>
            ) : (
              <>
                <FieldWrapper
                  label="Min Amount"
                  htmlFor="salaryMin"
                  required
                  error={fieldErrors.salaryMin}
                >
                  <div className="relative">
                    <input
                      id="salaryMin"
                      type="number"
                      min={0}
                      disabled={!amountsEnabled}
                      placeholder="e.g. 80000"
                      className={`${fieldInputClass} disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.salaryMin ? "border-red-300 focus:border-red-400 focus:ring-0" : ""}`}
                      value={formData.salaryMin ?? ""}
                      onChange={(e) => handleChange("salaryMin", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                      onKeyDown={blockNonNumericKey}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                </FieldWrapper>

                <FieldWrapper
                  label="Max Amount"
                  htmlFor="salaryMax"
                  required
                  error={fieldErrors.salaryMax}
                >
                  <div className="relative">
                    <input
                      id="salaryMax"
                      type="number"
                      min={0}
                      disabled={!amountsEnabled}
                      placeholder="e.g. 100000"
                      className={`${fieldInputClass} disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.salaryMax ? "border-red-300 focus:border-red-400 focus:ring-0" : ""}`}
                      value={formData.salaryMax ?? ""}
                      onChange={(e) => handleChange("salaryMax", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                      onKeyDown={blockNonNumericKey}
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                  </div>
                </FieldWrapper>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
