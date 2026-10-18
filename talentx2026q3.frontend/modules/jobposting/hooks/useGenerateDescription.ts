import { useMutation } from "@tanstack/react-query"
import {
  generateDescription,
  type GenerateDescriptionRequest,
} from "../services/job-generation.service"

export function useGenerateDescription() {
  return useMutation({
    mutationFn: (request: GenerateDescriptionRequest) => generateDescription(request),
  })
}
