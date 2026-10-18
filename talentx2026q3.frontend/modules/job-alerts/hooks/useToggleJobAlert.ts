'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/axios';
import { jobAlertsService } from '../services';
import type { ToggleJobAlertInput } from '../types';
import { jobAlertKeys } from './query-keys';

export function useToggleJobAlert() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, ToggleJobAlertInput>({
    mutationFn: ({ id, isEnabled }: ToggleJobAlertInput) =>
      jobAlertsService.toggleJobAlert(id, isEnabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobAlertKeys.lists() });
      toast.success(variables.isEnabled ? 'Job alert enabled.' : 'Job alert paused.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to toggle job alert.');
    },
  });
}
