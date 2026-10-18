'use client';

import { useQuery } from '@tanstack/react-query';
import { jobAlertsService } from '../services';
import type { JobAlert } from '../types';
import { jobAlertKeys } from './query-keys';

interface UseJobAlertsOptions {
  enabled?: boolean;
}

export function useJobAlerts(options?: UseJobAlertsOptions) {
  return useQuery<JobAlert[]>({
    queryKey: jobAlertKeys.lists(),
    queryFn: ({ signal }) => jobAlertsService.getJobAlerts(signal),
    enabled: options?.enabled ?? true,
  });
}
