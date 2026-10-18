'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/axios';
import { jobAlertsService } from '../services';
import type { CreateJobAlertInput } from '../types';
import { jobAlertKeys } from './query-keys';

export function useCreateJobAlert() {
  const queryClient = useQueryClient();

  return useMutation<string, ApiError, CreateJobAlertInput>({
    mutationFn: (payload: CreateJobAlertInput) => jobAlertsService.createJobAlert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobAlertKeys.lists() });
      toast.success('Job alert created successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create job alert.');
    },
  });
}
