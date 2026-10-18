import { talentProfileService } from "../services/talent-profile.service"
import type { ProjectUpsertPayload } from "../types/talent-profile.types"
import { useTalentProfileChildMutations } from "./useTalentProfileChildMutations"

export function useProjectMutations() {
  const { create, update, remove } = useTalentProfileChildMutations<ProjectUpsertPayload>({
    create: talentProfileService.createProject,
    update: talentProfileService.updateProject,
    remove: talentProfileService.deleteProject,
  })

  return {
    createProject: create,
    updateProject: update,
    deleteProject: remove,
  }
}
