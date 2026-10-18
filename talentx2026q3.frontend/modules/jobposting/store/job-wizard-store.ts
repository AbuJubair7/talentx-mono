import { create } from "zustand"

import type { JobFormValues } from "../types/job-schema"
import type { EmploymentType, ExperienceLevel, WorkArrangement } from "../types/job.types"

// Wizard step definitions
export const WIZARD_STEPS = [
  { id: 1, title: "Job Title", description: "Basic role information" },
  { id: 2, title: "Job Details", description: "Employment type & experience" },
  { id: 3, title: "Location", description: "Work arrangement & location" },
  { id: 4, title: "Skills", description: "Required skills" },
  { id: 5, title: "Description & Requirements", description: "Job description & requirements" },
  { id: 6, title: "Review", description: "Summary & publish" },
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]["id"]

const DEFAULT_FORM_DATA: JobFormValues = {
  title: "",
  companyName: "",
  employmentType: "FullTime" as EmploymentType,
  experienceLevel: "MidLevel" as ExperienceLevel,
  location: "",
  workArrangement: "OnSite" as WorkArrangement,
  requiredSkills: [],
  description: "",
  vacancies: 1,
  expireAt: "",
  city: "",
  country: undefined,
  minOverlapHours: undefined,
  salaryType: undefined,
  salaryCurrency: undefined,
  salaryPeriod: undefined,
  salaryMin: undefined,
  salaryMax: undefined,
  requirements: "",
}

// Wizard fields the AI can fill in.
export type AiGeneratedField = "skills" | "description" | "requirements"

// The wizard progress that can be saved and put back (e.g. from the local backup).
export interface WizardSnapshot {
  formData: JobFormValues
  currentStep: WizardStep
  completedSteps: WizardStep[]
  aiGenerated: Record<AiGeneratedField, boolean>
}

interface JobWizardState {
  currentStep: WizardStep
  formData: JobFormValues
  completedSteps: Set<WizardStep>
  fieldErrors: Record<string, string>
  aiGenerated: Record<AiGeneratedField, boolean>

  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void
  updateFormData: (data: Partial<JobFormValues>) => void
  markStepCompleted: (step: WizardStep) => void
  markAiGenerated: (field: AiGeneratedField) => void
  restore: (snapshot: WizardSnapshot) => void
  resetWizard: () => void
  setFieldErrors: (errors: Record<string, string>) => void
  clearFieldErrors: () => void
  isFirstStep: () => boolean
  isLastStep: () => boolean
}

const INITIAL_STATE: Pick<
  JobWizardState,
  "currentStep" | "formData" | "completedSteps" | "fieldErrors" | "aiGenerated"
> = {
  currentStep: 1,
  formData: { ...DEFAULT_FORM_DATA },
  completedSteps: new Set<WizardStep>(),
  fieldErrors: {},
  aiGenerated: { skills: false, description: false, requirements: false },
}

export const useJobWizardStore = create<JobWizardState>((set, get) => ({
  ...INITIAL_STATE,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 6) {
      set({ currentStep: (currentStep + 1) as WizardStep })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as WizardStep })
    }
  },

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  markStepCompleted: (step) =>
    set((state) => ({
      completedSteps: new Set([...state.completedSteps, step]),
    })),

  markAiGenerated: (field) =>
    set((state) => ({
      aiGenerated: { ...state.aiGenerated, [field]: true },
    })),

  restore: (snapshot) =>
    set({
      formData: { ...DEFAULT_FORM_DATA, ...snapshot.formData },
      currentStep: snapshot.currentStep,
      completedSteps: new Set(snapshot.completedSteps),
      aiGenerated: { ...INITIAL_STATE.aiGenerated, ...snapshot.aiGenerated },
      fieldErrors: {},
    }),

  resetWizard: () => set(INITIAL_STATE),

  setFieldErrors: (errors) => set({ fieldErrors: errors }),

  clearFieldErrors: () => set({ fieldErrors: {} }),

  isFirstStep: () => get().currentStep === 1,

  isLastStep: () => get().currentStep === 6,
}))
