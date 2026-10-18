'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/lib/api/axios'

import { savedJobsService } from '../services/saved-jobs.service'

export function useSaveJob() {
  const queryClient = useQueryClient()

  return useMutation<string, ApiError, string>({
    mutationFn: (jobId: string) => savedJobsService.saveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
    onError: (error) => {
      if (error.status === 409) {
        // Already saved — bring the saved-jobs caches back in sync, no error toast.
        queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
        return
      }
      toast.error(error.message || 'Failed to save job.')
    },
  })
}
