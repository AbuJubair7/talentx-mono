import { apiClient } from "@/lib/api/axios"
import { setAuthCookies } from "@/modules/auth/shared/auth-cookies.service"
import type { VerifyEmailResponse } from "../types/verify-email.types"

export async function verifyEmail(token: string): Promise<VerifyEmailResponse> {
  const { data } = await apiClient.post<VerifyEmailResponse>("/Auth/verify-email", { token })

  await setAuthCookies({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  })

  return data
}
