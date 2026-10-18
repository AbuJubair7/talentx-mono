import { talentProfileService } from "../services/talent-profile.service"
import type { EducationUpsertPayload } from "../types/talent-profile.types"
import { useTalentProfileChildMutations } from "./useTalentProfileChildMutations"

export function useEducationMutations() {
  const { create, update, remove } = useTalentProfileChildMutations<EducationUpsertPayload>({
    create: talentProfileService.createEducation,
    update: talentProfileService.updateEducation,
    remove: talentProfileService.deleteEducation,
  })

  return { createEducation: create, updateEducation: update, deleteEducation: remove }
}
