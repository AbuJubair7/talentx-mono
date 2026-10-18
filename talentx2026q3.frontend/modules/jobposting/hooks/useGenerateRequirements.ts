import { useMutation } from "@tanstack/react-query"
import {
  generateRequirements,
  type GenerateRequirementsRequest,
} from "../services/job-generation.service"

export function useGenerateRequirements() {
  return useMutation({
    mutationFn: (request: GenerateRequirementsRequest) => generateRequirements(request),
  })
}
