import { apiClient } from "@/lib/api/axios"
import type { CurrentEmployerDto } from "../types/me.types"

export const meService = {
  async getCurrentEmployer(): Promise<CurrentEmployerDto> {
    const { data } = await apiClient.get<CurrentEmployerDto>("/employers/me")
    return data
  },

  async reApply(): Promise<void> {
    await apiClient.post("/employers/me/re-apply")
  },
}
