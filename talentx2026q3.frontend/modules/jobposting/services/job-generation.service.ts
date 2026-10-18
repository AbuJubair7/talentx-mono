import { apiClient } from '@/lib/api/axios'

export interface GenerateDescriptionRequest {
  title: string
  companyName: string
  employmentType: string
  experienceLevel: string
  workArrangement: string
  requiredSkills?: string[]
}

export interface GenerateSkillsRequest {
  title: string
  companyName: string
  employmentType: string
  experienceLevel: string
  workArrangement: string
}

export interface GenerateRequirementsRequest {
  title: string
  companyName: string
  employmentType: string
  experienceLevel: string
  workArrangement: string
  requiredSkills?: string[]
}

export interface GenerateDescriptionResponse {
  description: string
}

export interface GenerateSkillsResponse {
  skills: string[]
}

export interface GenerateRequirementsResponse {
  requirements: string
}

export async function generateDescription(
  request: GenerateDescriptionRequest
): Promise<GenerateDescriptionResponse> {
  const response = await apiClient.post(
    "/jobs/generate-description",
    request
  )

  return response.data
}

export async function generateSkills(
  request: GenerateSkillsRequest
): Promise<GenerateSkillsResponse> {
  const response = await apiClient.post(
    "/jobs/generate-skills",
    request
  )

  return response.data
}

export async function generateRequirements(
  request: GenerateRequirementsRequest
): Promise<GenerateRequirementsResponse> {
  const response = await apiClient.post(
    "/jobs/generate-requirements",
    request
  )

  return response.data
}

