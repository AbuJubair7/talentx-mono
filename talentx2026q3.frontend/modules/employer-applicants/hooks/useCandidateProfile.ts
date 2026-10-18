import { useQuery } from '@tanstack/react-query';
import { applicantService } from '../services/applicant.service';
import { APPLICANT_QUERY_KEYS } from '../constants';

export function useCandidateProfile(applicationId: string | null) {
  return useQuery({
    queryKey: APPLICANT_QUERY_KEYS.profile(applicationId),
    queryFn: ({ signal }) => applicantService.getCandidateProfile(applicationId!, signal),
    enabled: !!applicationId,
  });
}

