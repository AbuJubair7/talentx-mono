import { apiClient } from "@/lib/api/axios"
import type { JobInvitation } from "@/modules/employer-jobs/types/employer-job.types"

export const invitationService = {
  getInvitationByToken: async (token: string, signal?: AbortSignal): Promise<JobInvitation> => {
    const { data } = await apiClient.get<JobInvitation>(`/talents/invitations/by-token/${token}`, { signal })
    return data
  },

  respondByToken: async (token: string, accept: boolean): Promise<JobInvitation> => {
    const { data } = await apiClient.patch<JobInvitation>(`/talents/invitations/by-token/${token}/respond`, { accept })
    return data
  },

  getMyInvitations: async (signal?: AbortSignal): Promise<JobInvitation[]> => {
    const { data } = await apiClient.get<JobInvitation[]>('/talents/invitations', { signal })
    return data
  },

  respondToInvitation: async (invitationId: string, accept: boolean): Promise<JobInvitation> => {
    const { data } = await apiClient.patch<JobInvitation>(`/talents/invitations/${invitationId}/respond`, { accept })
    return data
  }
}
