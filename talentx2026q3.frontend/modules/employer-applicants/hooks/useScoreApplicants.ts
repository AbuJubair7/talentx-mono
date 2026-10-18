import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicantService } from '../services/applicant.service';
import { APPLICANT_QUERY_KEYS } from '../constants';

export function useScoreApplicants(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => applicantService.scoreApplicants(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: APPLICANT_QUERY_KEYS.jobLists(jobId),
      });
    },
  });
}
