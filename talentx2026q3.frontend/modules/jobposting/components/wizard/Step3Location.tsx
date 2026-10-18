"use client"

import { useEffect, useRef } from "react"
import { MapPinIcon, GlobeIcon, ClockIcon } from "lucide-react"
import { useJobWizardStore } from "../../store/job-wizard-store"
import { FieldWrapper } from "../FieldWrapper"
import { fieldInputClass } from "../../utils/field-styles"
import { ToggleGroupField } from "../ToggleGroupField"
import { WORK_ARRANGEMENT_OPTIONS } from "../../utils/job-options"

export function Step3Location() {
  const { formData, updateFormData, fieldErrors, clearFieldErrors } = useJobWizardStore()

  const workArrangement = formData.workArrangement || "OnSite"
  const isOnSiteOrHybrid = workArrangement === "OnSite" || workArrangement === "Hybrid"
  const isRemote = workArrangement === "FullRemote" || workArrangement === "RemoteButAccessible"
  const isFullRemote = workArrangement === "FullRemote"

  const prevArrangementRef = useRef(workArrangement)
  useEffect(() => {
    if (prevArrangementRef.current !== workArrangement) {
      prevArrangementRef.current = workArrangement
      clearFieldErrors()
    }
    if (isRemote) {
      updateFormData({ location: "Anywhere" })
    } else if (formData.location === "Anywhere") {
      updateFormData({ location: "" })
    }
  }, [workArrangement])

  const handleChange = (field: string, value: string | number | null) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-6 transition-all duration-200 hover:border-slate-500 hover:shadow-md">
      <h2 className="text-lg font-semibold text-slate-900">Location & Work Arrangement</h2>
      <p className="mt-1 text-sm text-slate-500">
        Define where and how this role will be performed.
      </p>

      <div className="mt-6 space-y-6">
        <ToggleGroupField
          label="Work Arrangement"
          value={workArrangement}
          options={WORK_ARRANGEMENT_OPTIONS}
          onChange={(value) => handleChange("workArrangement", value)}
          required
          error={fieldErrors.workArrangement}
        />

        <FieldWrapper
          label="Location"
          htmlFor="location"
          required
          error={fieldErrors.location}
        >
          <div className="relative">
            <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="location"
              placeholder="e.g. Sel Rose N Dale, Dhaka 1205"
              className={`${fieldInputClass} pl-11 ${fieldErrors.location ? "border-red-400 focus:border-red-400 focus:ring-0" : ""}`}
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>
        </FieldWrapper>

        {/* City & Country — always visible, required only for OnSite/Hybrid */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">City & Country</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrapper
              label="City"
              htmlFor="city"
              required={isOnSiteOrHybrid}
              error={fieldErrors.city}
            >
              <div className="relative">
                <GlobeIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="city"
                  placeholder="e.g. Dhaka"
                  className={`${fieldInputClass} pl-11 ${fieldErrors.city ? "border-red-400 focus:border-red-400 focus:ring-0" : ""}`}
                  value={formData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
            </FieldWrapper>

            <FieldWrapper
              label="Country"
              htmlFor="country"
              required={isOnSiteOrHybrid}
              error={fieldErrors.country}
            >
              <div className="relative">
                <GlobeIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="country"
                  placeholder="e.g. Bangladesh"
                  className={`${fieldInputClass} pl-11 ${fieldErrors.country ? "border-red-400 focus:border-red-400 focus:ring-0" : ""}`}
                  value={formData.country || ""}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
              </div>
            </FieldWrapper>
          </div>
          {!isOnSiteOrHybrid && (
            <p className="mt-3 text-xs text-slate-500">Optional for this work arrangement</p>
          )}
        </div>

        {isFullRemote && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700 mb-4">
              Minimum overlap hours is required for Anywhere/Full Remote roles
            </p>
            <FieldWrapper
              label="Minimum Overlap Hours"
              htmlFor="minOverlapHours"
              required={isFullRemote}
              error={fieldErrors.minOverlapHours}
            >
              <div className="relative">
                <ClockIcon className="pointer-events-none absolute left-2 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="minOverlapHours"
                  type="number"
                  min={1}
                  max={8}
                  placeholder="e.g. 4"
                  className={`${fieldInputClass} max-w-[130px] pl-11 font-mono ${fieldErrors.minOverlapHours ? "border-red-400 focus:border-red-400 focus:ring-0" : ""}`}
                  value={formData.minOverlapHours || ""}
                  onChange={(e) => handleChange("minOverlapHours", parseInt(e.target.value) || null)}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Required working hours overlap with your team&apos;s timezone.
              </p>
            </FieldWrapper>
          </div>
        )}
      </div>
    </div>
  )
}
