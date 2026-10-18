import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { companyProfileService } from '../services/company-profile.service';
import type { PublicCompanyProfileDto } from '../types/company-profile.types';
import { companyProfileKeys } from './querykeys';

export function usePublicCompanyProfile(
  slugOrId: string,
  options?: Partial<UseQueryOptions<PublicCompanyProfileDto, Error>>
) {
  return useQuery<PublicCompanyProfileDto, Error>({
    queryKey: companyProfileKeys.publicProfile(slugOrId),
    queryFn: ({ signal }) => companyProfileService.getPublicCompanyProfile(slugOrId, signal),
    enabled: Boolean(slugOrId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}
