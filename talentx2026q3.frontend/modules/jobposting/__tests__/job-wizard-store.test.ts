import { useJobWizardStore, WIZARD_STEPS } from "../store/job-wizard-store"

// Reset store between tests
beforeEach(() => {
  useJobWizardStore.getState().resetWizard()
})

describe("job-wizard-store", () => {
  describe("initial state", () => {
    it("starts at step 1", () => {
      expect(useJobWizardStore.getState().currentStep).toBe(1)
    })

    it("starts with empty form data defaults", () => {
      const { formData } = useJobWizardStore.getState()
      expect(formData.title).toBe("")
      expect(formData.companyName).toBe("")
      expect(formData.employmentType).toBe("FullTime")
      expect(formData.experienceLevel).toBe("MidLevel")
      expect(formData.workArrangement).toBe("OnSite")
      expect(formData.requiredSkills).toEqual([])
      expect(formData.vacancies).toBe(1)
      expect(formData.expireAt).toBe("")
      expect(formData.city).toBe("")
      expect(formData.country).toBeUndefined()
      expect(formData.minOverlapHours).toBeUndefined()
    })

    it("starts with no completed steps", () => {
      expect(useJobWizardStore.getState().completedSteps.size).toBe(0)
    })

    it("starts with no field errors", () => {
      expect(useJobWizardStore.getState().fieldErrors).toEqual({})
    })
  })

  describe("setStep", () => {
    it("sets the current step", () => {
      useJobWizardStore.getState().setStep(3)
      expect(useJobWizardStore.getState().currentStep).toBe(3)
    })
  })

  describe("nextStep", () => {
    it("advances to the next step", () => {
      useJobWizardStore.getState().nextStep()
      expect(useJobWizardStore.getState().currentStep).toBe(2)
    })

    it("does not advance beyond step 6", () => {
      useJobWizardStore.getState().setStep(6)
      useJobWizardStore.getState().nextStep()
      expect(useJobWizardStore.getState().currentStep).toBe(6)
    })
  })

  describe("prevStep", () => {
    it("goes back to the previous step", () => {
      useJobWizardStore.getState().setStep(3)
      useJobWizardStore.getState().prevStep()
      expect(useJobWizardStore.getState().currentStep).toBe(2)
    })

    it("does not go below step 1", () => {
      useJobWizardStore.getState().prevStep()
      expect(useJobWizardStore.getState().currentStep).toBe(1)
    })
  })

  describe("updateFormData", () => {
    it("updates a single field", () => {
      useJobWizardStore.getState().updateFormData({ title: "Backend Engineer" })
      expect(useJobWizardStore.getState().formData.title).toBe("Backend Engineer")
    })

    it("updates multiple fields at once", () => {
      useJobWizardStore.getState().updateFormData({
        title: "Frontend Engineer",
        companyName: "Acme Corp",
        vacancies: 3,
      })
      const { formData } = useJobWizardStore.getState()
      expect(formData.title).toBe("Frontend Engineer")
      expect(formData.companyName).toBe("Acme Corp")
      expect(formData.vacancies).toBe(3)
    })

    it("preserves other fields when updating", () => {
      useJobWizardStore.getState().updateFormData({ title: "QA Engineer" })
      expect(useJobWizardStore.getState().formData.employmentType).toBe("FullTime")
    })

    it("updates city field", () => {
      useJobWizardStore.getState().updateFormData({ city: "Dhaka" })
      expect(useJobWizardStore.getState().formData.city).toBe("Dhaka")
    })

    it("updates country field", () => {
      useJobWizardStore.getState().updateFormData({ country: "Bangladesh" })
      expect(useJobWizardStore.getState().formData.country).toBe("Bangladesh")
    })

    it("updates minOverlapHours field", () => {
      useJobWizardStore.getState().updateFormData({ minOverlapHours: 4 })
      expect(useJobWizardStore.getState().formData.minOverlapHours).toBe(4)
    })
  })

  describe("markStepCompleted", () => {
    it("marks a step as completed", () => {
      useJobWizardStore.getState().markStepCompleted(1)
      expect(useJobWizardStore.getState().completedSteps.has(1)).toBe(true)
    })

    it("can mark multiple steps as completed", () => {
      useJobWizardStore.getState().markStepCompleted(1)
      useJobWizardStore.getState().markStepCompleted(2)
      useJobWizardStore.getState().markStepCompleted(3)
      const steps = useJobWizardStore.getState().completedSteps
      expect(steps.size).toBe(3)
      expect(steps.has(1)).toBe(true)
      expect(steps.has(2)).toBe(true)
      expect(steps.has(3)).toBe(true)
    })

    it("does not duplicate completed steps", () => {
      useJobWizardStore.getState().markStepCompleted(1)
      useJobWizardStore.getState().markStepCompleted(1)
      expect(useJobWizardStore.getState().completedSteps.size).toBe(1)
    })
  })

  describe("markAiGenerated", () => {
    it("starts with no field marked as AI-generated", () => {
      expect(useJobWizardStore.getState().aiGenerated).toEqual({
        skills: false,
        description: false,
        requirements: false,
      })
    })

    it("marks only the given field as AI-generated", () => {
      useJobWizardStore.getState().markAiGenerated("description")
      expect(useJobWizardStore.getState().aiGenerated).toEqual({
        skills: false,
        description: true,
        requirements: false,
      })
    })
  })

  describe("resetWizard", () => {
    it("resets all state to initial values", () => {
      useJobWizardStore.getState().setStep(4)
      useJobWizardStore.getState().updateFormData({ title: "Test" })
      useJobWizardStore.getState().markStepCompleted(1)
      useJobWizardStore.getState().setFieldErrors({ title: "Error" })
      useJobWizardStore.getState().markAiGenerated("skills")

      useJobWizardStore.getState().resetWizard()

      const state = useJobWizardStore.getState()
      expect(state.currentStep).toBe(1)
      expect(state.formData.title).toBe("")
      expect(state.completedSteps.size).toBe(0)
      expect(state.fieldErrors).toEqual({})
      expect(state.aiGenerated.skills).toBe(false)
    })
  })

  describe("fieldErrors", () => {
    it("sets field errors", () => {
      useJobWizardStore.getState().setFieldErrors({ title: "Required", city: "Required" })
      expect(useJobWizardStore.getState().fieldErrors).toEqual({
        title: "Required",
        city: "Required",
      })
    })

    it("clears field errors", () => {
      useJobWizardStore.getState().setFieldErrors({ title: "Error" })
      useJobWizardStore.getState().clearFieldErrors()
      expect(useJobWizardStore.getState().fieldErrors).toEqual({})
    })
  })

  describe("isFirstStep / isLastStep", () => {
    it("isFirstStep returns true when at step 1", () => {
      expect(useJobWizardStore.getState().isFirstStep()).toBe(true)
    })

    it("isFirstStep returns false when not at step 1", () => {
      useJobWizardStore.getState().setStep(2)
      expect(useJobWizardStore.getState().isFirstStep()).toBe(false)
    })

    it("isLastStep returns true when at step 6", () => {
      useJobWizardStore.getState().setStep(6)
      expect(useJobWizardStore.getState().isLastStep()).toBe(true)
    })

    it("isLastStep returns false when not at step 6", () => {
      expect(useJobWizardStore.getState().isLastStep()).toBe(false)
    })
  })

  describe("WIZARD_STEPS", () => {
    it("has 6 steps", () => {
      expect(WIZARD_STEPS).toHaveLength(6)
    })

    it("has sequential step ids from 1 to 6", () => {
      expect(WIZARD_STEPS.map((s) => s.id)).toEqual([1, 2, 3, 4, 5, 6])
    })
  })
})
