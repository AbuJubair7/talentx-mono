'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/lib/api/axios'

import { savedJobsService } from '../services/saved-jobs.service'

export function useRemoveSavedJob() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, string>({
    mutationFn: (jobId: string) => savedJobsService.removeSavedJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove saved job.')
    },
  })
}
