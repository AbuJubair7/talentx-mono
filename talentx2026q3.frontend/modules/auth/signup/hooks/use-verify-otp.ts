'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signupService } from '../services/signup.service'
import type { VerifyEmailRequest, SendOtpRequest, AuthEmployerResponse } from '../types/signup.types'

export function useVerifyOtp() {
  const router = useRouter()

  return useMutation<AuthEmployerResponse, Error, VerifyEmailRequest>({
    mutationFn: (data) => signupService.verifyEmail(data),
    onSuccess: (data, variables) => {
      const userEmail = data.employer?.email || variables.email || ''
      router.push(`/onboarding?email=${encodeURIComponent(userEmail)}`)
    },
  })
}

export function useSendOtp() {
  return useMutation<{ message: string }, Error, SendOtpRequest>({
    mutationFn: (data) => signupService.sendOtp(data),
  })
}
