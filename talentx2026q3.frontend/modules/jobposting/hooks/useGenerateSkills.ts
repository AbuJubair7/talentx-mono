import { useMutation } from "@tanstack/react-query"
import {
  generateSkills,
  type GenerateSkillsRequest,
} from "../services/job-generation.service"

export function useGenerateSkills() {
  return useMutation({
    mutationFn: (request: GenerateSkillsRequest) => generateSkills(request),
  })
}
