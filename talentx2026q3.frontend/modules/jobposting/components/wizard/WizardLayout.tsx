"use client"

import { Fragment } from "react"
import { Trash2 } from "lucide-react"
import { useJobWizardStore, WIZARD_STEPS } from "../../store/job-wizard-store"
import { eyebrowLabelClass } from "../../utils/field-styles"
import { PortalPageContainer } from "@/components/layout"
import { SaveStatusIndicator, type SaveStatus } from "./SaveStatusIndicator"

interface WizardLayoutProps {
  children: React.ReactNode
  // The "Save & exit" button: keeps the draft and leaves the wizard.
  onSaveDraft: () => void
  onPublish: () => void
  // Asks to throw away the job in progress; the button is hidden when not given.
  onDiscard?: () => void
  // False when there is nothing to discard yet.
  canDiscard?: boolean
  // Where the latest changes are kept; the indicator is hidden when not given.
  saveStatus?: SaveStatus
  // Called after a step passes validation and the wizard moves on (the view saves a draft then).
  onStepComplete?: () => void
  isSubmitting: boolean
  validateStep: (step: number) => string[]
}

export function WizardLayout({
  children,
  onSaveDraft,
  onPublish,
  onDiscard,
  canDiscard = true,
  saveStatus,
  onStepComplete,
  isSubmitting,
  validateStep,
}: WizardLayoutProps) {
  const {
    currentStep,
    completedSteps,
    setStep,
    isFirstStep,
    isLastStep,
    fieldErrors,
    setFieldErrors,
    clearFieldErrors,
  } = useJobWizardStore()

  function handleNext() {
    const errors = validateStep(currentStep)
    if (errors.length > 0) {
      const parsed: Record<string, string> = {}
      errors.forEach((err) => {
        const [field, message] = err.split(":")
        parsed[field] = message
      })
      setFieldErrors(parsed)
      return
    }
    clearFieldErrors()
    useJobWizardStore.getState().markStepCompleted(currentStep)
    useJobWizardStore.getState().nextStep()
    onStepComplete?.()
  }

  function handleStepClick(stepId: number) {
    if (stepId <= currentStep || completedSteps.has(stepId as any)) {
      clearFieldErrors()
      setStep(stepId as any)
    }
  }

  return (
    <div className="min-h-full w-full font-sans text-slate-900">
      <PortalPageContainer className="pb-24 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="max-w-2xl">
            <span className={`${eyebrowLabelClass} text-emerald-600`}>Employer · Job posting</span>
          </div>
        </div>

        {/* Horizontal step indicator */}
        <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-2">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.id as any) && currentStep !== step.id
            const isCurrent = currentStep === step.id
            const isPending = step.id > currentStep && !completedSteps.has(step.id as any)
            return (
              <Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={isPending}
                  className={`flex items-center gap-2.5 shrink-0 rounded-lg px-3 py-2 transition-all duration-200 ${isPending ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? "bg-slate-900 text-white"
                        : isCurrent
                          ? "border-2 border-emerald-500 text-emerald-600"
                          : "border border-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? "✓" : step.id}
                  </span>
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${
                      isCompleted
                        ? "text-slate-900"
                        : isCurrent
                          ? "text-emerald-600 font-semibold"
                          : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 shrink-0 ${
                      completedSteps.has(step.id as any) ? "bg-slate-900" : "bg-slate-200"
                    }`}
                  />
                )}
              </Fragment>
            )
          })}
        </div>

        {/* Step content */}
        <div className="mt-8">{children}</div>

        {/* Navigation */}
        {/* Phones: Back/Next first (full width, thumb reach), then Save + Discard, then the status line.
            From sm up: saving on the left, step navigation on the right. */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="order-2 flex flex-col gap-2 sm:order-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save & exit"}
              </button>
              {onDiscard && (
                // Kept apart from Save & exit (far right on phones) so it isn't hit by mistake; it always confirms.
                <button
                  type="button"
                  onClick={onDiscard}
                  disabled={isSubmitting || !canDiscard}
                  className="ml-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer sm:ml-2"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Discard
                </button>
              )}
            </div>
            {saveStatus !== undefined && <SaveStatusIndicator status={saveStatus} />}
          </div>

          <div className="order-1 flex items-center gap-3 sm:order-2">
            {!isFirstStep() && (
              <button
                type="button"
                onClick={() => {
                  clearFieldErrors()
                  useJobWizardStore.getState().prevStep()
                }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm cursor-pointer sm:flex-none"
              >
                Back
              </button>
            )}

            {isLastStep() ? (
              <button
                type="button"
                onClick={onPublish}
                disabled={isSubmitting}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold whitespace-nowrap text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 cursor-pointer sm:flex-none"
              >
                {isSubmitting ? "Publishing..." : "Publish Job"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md cursor-pointer sm:flex-none"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </PortalPageContainer>
    </div>
  )
}
