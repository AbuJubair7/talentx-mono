import { talentProfileService } from "../services/talent-profile.service"
import type { WorkExperienceUpsertPayload } from "../types/talent-profile.types"
import { useTalentProfileChildMutations } from "./useTalentProfileChildMutations"

export function useWorkExperienceMutations() {
  const { create, update, remove } = useTalentProfileChildMutations<WorkExperienceUpsertPayload>({
    create: talentProfileService.createWorkExperience,
    update: talentProfileService.updateWorkExperience,
    remove: talentProfileService.deleteWorkExperience,
  })

  return { createWorkExperience: create, updateWorkExperience: update, deleteWorkExperience: remove }
}
