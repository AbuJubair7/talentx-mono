'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/axios';
import { jobAlertsService } from '../services';
import { jobAlertKeys } from './query-keys';

export function useDeleteJobAlert() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (id: string) => jobAlertsService.deleteJobAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobAlertKeys.lists() });
      toast.success('Job alert deleted successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete job alert.');
    },
  });
}
