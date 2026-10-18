'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signupService } from '../services/signup.service'
import type { GoogleSignInRequest, AuthEmployerResponse } from '../types/signup.types'
import { setAuthCookies } from '../../shared/auth-cookies.service' 

export function useGoogleSignIn() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation<AuthEmployerResponse, Error, GoogleSignInRequest>({
    mutationFn: (data) => signupService.googleSignIn(data),
    onSuccess: async (data) => {
      // Store JWT access token and refresh token in cookies
      await setAuthCookies({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['employer'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });

      // Directly redirect to Dashboard upon successful Google sign-in
      router.push('/dashboard');
      router.refresh();
    },
  })
}
