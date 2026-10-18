export interface VerifyEmailResponse {
  userId: string
  email: string
  accessToken: string
  refreshToken: string
  requiresPasswordChange: boolean
}
