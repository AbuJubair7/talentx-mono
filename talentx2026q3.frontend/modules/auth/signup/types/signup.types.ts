import type { UserRole } from "@/types/auth"

export interface CreateEmployerRequest {
  name: string
  email: string
  companyName: string
  password: string
  confirmPassword: string
}

export interface GoogleSignInRequest {
  idToken: string
}

export interface VerifyEmailRequest {
  email: string
  otp: string
}

export interface SendOtpRequest {
  email: string
}

export interface EmployerResponse {
  id: string
  userId: string
  name: string
  email: string
  companyName: string
  role: UserRole
  isVerified: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface AuthEmployerResponse {
  employer?: EmployerResponse | null
  accessToken: string
  refreshToken: string
}
