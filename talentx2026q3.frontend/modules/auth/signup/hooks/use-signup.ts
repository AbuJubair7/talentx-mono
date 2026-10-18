'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signupService } from '../services/signup.service'
import type { CreateEmployerRequest, AuthEmployerResponse } from '../types/signup.types'
import { setAuthCookies } from '../../shared/auth-cookies.service'

export function useSignupEmployer() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation<AuthEmployerResponse, Error, CreateEmployerRequest>({
    mutationFn: (data) => signupService.registerEmployer(data),
    onSuccess: async (data) => {
      await setAuthCookies({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['employer'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });

      router.push('/job/job-listing');
      router.refresh();
    },
  })
}
