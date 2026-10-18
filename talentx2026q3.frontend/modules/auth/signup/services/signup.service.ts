import { apiClient } from "@/lib/api/axios";
import type {
  CreateEmployerRequest,
  GoogleSignInRequest,
  VerifyEmailRequest,
  SendOtpRequest,
  AuthEmployerResponse,
} from "../types/signup.types";

export const signupService = {
  /**
   * Registers a new employer account and completes onboarding, returning JWT session tokens.
   */
  async registerEmployer(
    payload: CreateEmployerRequest,
  ): Promise<AuthEmployerResponse> {
    const { data } = await apiClient.post<AuthEmployerResponse>(
      "/employers",
      payload,
    );
    return data;
  },

  /**
   * Authenticates or registers an employer via Google OAuth ID token, returning JWT session tokens.
   */
  async googleSignIn(
    payload: GoogleSignInRequest,
  ): Promise<AuthEmployerResponse> {
    const { data } = await apiClient.post<AuthEmployerResponse>(
      "/employers/google",
      payload,
    );
    return data;
  },

  /**
   * Verifies the employer's email using the 6-digit OTP code and returns JWT session tokens for instant login.
   */
  async verifyEmail(
    payload: VerifyEmailRequest,
  ): Promise<AuthEmployerResponse> {
    const { data } = await apiClient.post<AuthEmployerResponse>(
      "/employers/verify-email",
      payload,
    );
    return data;
  },

  /**
   * Dispatches a 6-digit verification OTP code to the given email address.
   */
  async sendOtp(payload: SendOtpRequest): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      "/employers/send-otp",
      payload,
    );
    return data;
  },
};
