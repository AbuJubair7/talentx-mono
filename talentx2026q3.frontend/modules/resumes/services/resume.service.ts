import { apiClient } from "@/lib/api/axios"
import {
  ResumeExtractionResult,
  SavedResume,
  SavedResumeListResponse,
  SavedResumeUrlResponse,
} from "../types/resume.types"

export async function uploadResume(file: File): Promise<ResumeExtractionResult> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiClient.post<ResumeExtractionResult>(
    "/Resumes/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )

  return response.data
}

export interface SaveResumeOptions {
  displayName?: string
  updateProfile?: boolean
}

export const resumeLibraryService = {
  async listResumes(): Promise<SavedResumeListResponse> {
    const { data } = await apiClient.get<SavedResumeListResponse>("/talents/me/resumes")
    return data
  },

  async saveResume(file: File, options: SaveResumeOptions = {}): Promise<SavedResume> {
    const formData = new FormData()
    formData.append("file", file)
    if (options.displayName?.trim()) {
      formData.append("displayName", options.displayName.trim())
    }
    formData.append("updateProfile", String(options.updateProfile ?? false))

    const { data } = await apiClient.post<SavedResume>("/talents/me/resumes", formData)
    return data
  },

  async renameResume(id: string, displayName: string): Promise<SavedResume> {
    const { data } = await apiClient.put<SavedResume>(`/talents/me/resumes/${id}`, { displayName })
    return data
  },

  async setDefaultResume(id: string): Promise<SavedResume> {
    const { data } = await apiClient.put<SavedResume>(`/talents/me/resumes/${id}/default`)
    return data
  },

  async deleteResume(id: string): Promise<void> {
    await apiClient.delete(`/talents/me/resumes/${id}`)
  },

  async getResumeUrl(id: string): Promise<SavedResumeUrlResponse> {
    const { data } = await apiClient.get<SavedResumeUrlResponse>(`/talents/me/resumes/${id}/url`)
    return data
  },
}
