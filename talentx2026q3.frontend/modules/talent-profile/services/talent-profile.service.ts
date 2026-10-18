import { apiClient } from "@/lib/api/axios"
import type { ResumeExtractionResult } from "@/modules/resumes/types/resume.types"

import type { PartETag, PresignedUploadTarget, InitiateMultipartResult, UploadedPartInfo } from "../types/media-upload.types"
import type {
  ApplyExtractedProfilePayload,
  EducationUpsertPayload,
  ProjectUpsertPayload,
  TalentProfileDto,
  UpdateTalentProfilePayload,
  WorkExperienceUpsertPayload,
} from "../types/talent-profile.types"

export const talentProfileService = {
  async getMyProfile(): Promise<TalentProfileDto> {
    const { data } = await apiClient.get<TalentProfileDto>("/talents/me")
    return data
  },

  async updateMyProfile(payload: UpdateTalentProfilePayload): Promise<void> {
    await apiClient.put("/talents/me", payload)
  },

  async requestProfilePictureUploadUrl(contentType: string): Promise<PresignedUploadTarget> {
    const { data } = await apiClient.post<PresignedUploadTarget>("/talents/me/media/upload-url", { contentType })
    return data
  },

  async confirmProfilePictureUpload(storageKey: string): Promise<void> {
    await apiClient.post("/talents/me/media/confirm", { storageKey })
  },

  async initiateVideoMultipartUpload(contentType: string): Promise<InitiateMultipartResult> {
    const { data } = await apiClient.post<InitiateMultipartResult>("/talents/me/media/multipart/initiate", {
      contentType,
    })
    return data
  },

  async requestVideoPartUploadUrl(storageKey: string, uploadId: string, partNumber: number): Promise<string> {
    const { data } = await apiClient.post<{ presignedUrl: string }>("/talents/me/media/multipart/part-url", {
      storageKey,
      uploadId,
      partNumber,
    })
    return data.presignedUrl
  },

  async listVideoMultipartParts(storageKey: string, uploadId: string): Promise<UploadedPartInfo[]> {
    const { data } = await apiClient.get<{ parts: UploadedPartInfo[] }>("/talents/me/media/multipart/parts", {
      params: { storageKey, uploadId },
    })
    return data.parts
  },

  async completeVideoMultipartUpload(storageKey: string, uploadId: string, parts: PartETag[]): Promise<void> {
    await apiClient.post("/talents/me/media/multipart/complete", { storageKey, uploadId, parts })
  },

  async abortVideoMultipartUpload(storageKey: string, uploadId: string): Promise<void> {
    await apiClient.post("/talents/me/media/multipart/abort", { storageKey, uploadId })
  },

  // No manual Content-Type header here — a boundary-less
  // "multipart/form-data" set by hand can produce an unparseable body on
  // some adapters/browsers. Passing the FormData with no header override
  // lets axios/the browser generate the correct boundary-included header.
  async extractResume(file: File): Promise<ResumeExtractionResult> {
    const formData = new FormData()
    formData.append("file", file)
    const { data } = await apiClient.post<ResumeExtractionResult>("/talents/me/resume/extract", formData)
    return data
  },

  // The resume's raw bytes are resubmitted here (nothing was written to
  // storage during extraction) alongside the edited payload as a JSON string
  // form field, since apply-extraction is now multipart/form-data rather than
  // a plain JSON body.
  async applyExtractedProfile(payload: ApplyExtractedProfilePayload, resumeFile?: File): Promise<void> {
    const formData = new FormData()
    if (resumeFile) {
      formData.append("file", resumeFile)
    }
    formData.append("payload", JSON.stringify(payload))
    await apiClient.post("/talents/me/profile/apply-extraction", formData)
  },

  async createWorkExperience(payload: WorkExperienceUpsertPayload): Promise<{ id: string }> {
    const { data } = await apiClient.post<{ id: string }>("/talents/me/work-experiences", payload)
    return data
  },

  async updateWorkExperience(id: string, payload: WorkExperienceUpsertPayload): Promise<void> {
    await apiClient.put(`/talents/me/work-experiences/${id}`, payload)
  },

  async deleteWorkExperience(id: string): Promise<void> {
    await apiClient.delete(`/talents/me/work-experiences/${id}`)
  },

  async createEducation(payload: EducationUpsertPayload): Promise<{ id: string }> {
    const { data } = await apiClient.post<{ id: string }>("/talents/me/educations", payload)
    return data
  },

  async updateEducation(id: string, payload: EducationUpsertPayload): Promise<void> {
    await apiClient.put(`/talents/me/educations/${id}`, payload)
  },

  async deleteEducation(id: string): Promise<void> {
    await apiClient.delete(`/talents/me/educations/${id}`)
  },

  createProject: async (payload: ProjectUpsertPayload): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>("/talents/me/projects", payload)
    return response.data
  },

  updateProject: async (id: string, payload: ProjectUpsertPayload): Promise<void> => {
    await apiClient.put(`/talents/me/projects/${id}`, payload)
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/talents/me/projects/${id}`)
  },
}
