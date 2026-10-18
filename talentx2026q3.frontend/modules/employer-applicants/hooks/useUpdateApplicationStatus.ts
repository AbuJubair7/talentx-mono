import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicantService } from '../services/applicant.service';
import { APPLICANT_QUERY_KEYS } from '../constants';
import type { ApplicationStatus } from '../types/applicant.types';

export function useUpdateApplicationStatus(jobId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, newStatus }: { applicationId: string; newStatus: ApplicationStatus }) =>
      applicantService.updateApplicationStatus(applicationId, newStatus),
    onSuccess: (_, { applicationId }) => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: APPLICANT_QUERY_KEYS.jobLists(jobId) });
      } else {
        queryClient.invalidateQueries({ queryKey: APPLICANT_QUERY_KEYS.all });
      }
      queryClient.invalidateQueries({ queryKey: APPLICANT_QUERY_KEYS.profile(applicationId) });
      queryClient.invalidateQueries({ queryKey: ['employer', 'dashboard'] });
    },
  });
}
