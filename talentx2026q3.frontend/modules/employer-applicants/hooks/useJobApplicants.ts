import { useQuery } from '@tanstack/react-query';
import { applicantService } from '../services/applicant.service';
import { APPLICANT_QUERY_KEYS } from '../constants';
import type { GetJobApplicantsQueryParams } from '../types/applicant.types';

export function useJobApplicants(jobId: string, params?: GetJobApplicantsQueryParams) {
  return useQuery({
    queryKey: APPLICANT_QUERY_KEYS.list(jobId, params),
    queryFn: ({ signal }) => applicantService.getJobApplicants(jobId, params, signal),
    enabled: !!jobId,
  });
}

