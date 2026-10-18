import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { companyProfileService } from '../services/company-profile.service';
import type { CompanyProfileDto } from '../types/company-profile.types';
import { companyProfileKeys } from './querykeys';

export function useCompanyProfile(
  options?: Partial<UseQueryOptions<CompanyProfileDto, Error>>
) {
  return useQuery<CompanyProfileDto, Error>({
    queryKey: companyProfileKeys.mine(),
    queryFn: ({ signal }) => companyProfileService.getMyCompanyProfile(signal),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}
