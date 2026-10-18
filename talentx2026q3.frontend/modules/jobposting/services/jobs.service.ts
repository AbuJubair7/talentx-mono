import { apiClient } from "@/lib/api/axios"

import type { CreateJobPayload, JobDto, UpdateJobPayload } from "../types/job.types"

export const jobsService = {
  async createJob(payload: CreateJobPayload): Promise<string> {
    const { data } = await apiClient.post<string>("/Jobs", payload)
    return data
  },

  async updateJob(id: string, payload: UpdateJobPayload): Promise<void> {
    await apiClient.patch(`/Jobs/${id}`, payload)
  },

  async getJob(id: string): Promise<JobDto> {
    const { data } = await apiClient.get<JobDto>(`/Jobs/mine/${id}`)
    return data
  },
}
