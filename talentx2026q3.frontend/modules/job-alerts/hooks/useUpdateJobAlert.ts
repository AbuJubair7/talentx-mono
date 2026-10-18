'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/axios';
import { jobAlertsService } from '../services';
import type { UpdateJobAlertInput } from '../types';
import { jobAlertKeys } from './query-keys';

export interface UpdateJobAlertVariables {
  id: string;
  input: UpdateJobAlertInput;
}

export function useUpdateJobAlert() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, UpdateJobAlertVariables>({
    mutationFn: ({ id, input }: UpdateJobAlertVariables) =>
      jobAlertsService.updateJobAlert(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobAlertKeys.lists() });
      toast.success('Job alert updated successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update job alert.');
    },
  });
}
