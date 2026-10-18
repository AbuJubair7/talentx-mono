import { apiClient } from "@/lib/api/axios";

import type {
  ApplicationPrefill,
  ApplicationSubmitted,
  ApplyPayload,
  UploadApplicationResumeResponse,
} from "../types/job-application.types";

import type { ApplyToJobPayload, ApplyToJobResponse } from "../types/application.types";


export const jobApplicationService = {
  // Authenticated Talent only — the backend fills these from the caller's profile.
  getPrefill: async (signal?: AbortSignal) => {
    const { data } = await apiClient.get<ApplicationPrefill>(
      "/talents/me/application-prefill",
      { signal },
    )
    return data
  },

  uploadApplicationResume: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const { data } = await apiClient.post<UploadApplicationResumeResponse>(
      "/jobs/application-resumes",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return data
  },

  // Creates the current Talent's application for the job. Talent id comes from the token.
  submitApplication: async (jobId: string, payload: ApplyPayload) => {
    const { data } = await apiClient.post<ApplicationSubmitted>(
      `/jobs/${jobId}/applications`,
      payload,
    )
    return data
  },
}

export async function applyToJob(
  jobId: string,
  payload: ApplyToJobPayload | FormData
): Promise<ApplyToJobResponse> {
  const formData = payload instanceof FormData ? payload : createApplyFormData(payload)
  const { data } = await apiClient.post<ApplyToJobResponse>(`/Jobs/${jobId}/apply`, formData)
  return data
}

function createApplyFormData(payload: ApplyToJobPayload): FormData {
  const formData = new FormData()
  formData.append("ApplicantName", payload.applicantName)
  formData.append("ApplicantEmail", payload.applicantEmail)
  if (payload.resumeFile) {
    formData.append("ResumeFile", payload.resumeFile)
  }
  formData.append("CoverLetter", payload.coverLetter)
  formData.append("ExpectedSalary", String(payload.expectedSalary))
  formData.append("TotalYearsExperience", String(payload.totalYearsExperience))
  if (payload.location) {
    formData.append("Location", payload.location)
  }
  if (payload.extractedTechnicalSkills?.length) {
    formData.append("ExtractedTechnicalSkills", JSON.stringify(payload.extractedTechnicalSkills))
  }
  if (payload.extractedSoftSkills?.length) {
    formData.append("ExtractedSoftSkills", JSON.stringify(payload.extractedSoftSkills))
  }
  if (payload.extractedToolsAndPlatforms?.length) {
    formData.append("ExtractedToolsAndPlatforms", JSON.stringify(payload.extractedToolsAndPlatforms))
  }
  if (payload.extractedWorkExperience?.length) {
    formData.append("ExtractedWorkExperience", JSON.stringify(payload.extractedWorkExperience))
  }
  if (payload.extractedEducation?.length) {
    formData.append("ExtractedEducation", JSON.stringify(payload.extractedEducation))
  }
  if (payload.extractedProjects?.length) {
    formData.append("ExtractedProjects", JSON.stringify(payload.extractedProjects))
  }
  if (payload.extractedProfile) {
    formData.append(
      "ExtractedProfile",
      typeof payload.extractedProfile === "string"
        ? payload.extractedProfile
        : JSON.stringify(payload.extractedProfile)
    )
  }
  return formData
}

export { createApplyFormData }
