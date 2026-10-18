import { useQuery } from '@tanstack/react-query';
import { companiesService } from '../services/companies.service';
import type { CompanyFilterParams, PagedCompanies } from '../types/company-list.types';
import { companiesKeys } from './queryKeys';

export function usePublicCompanies(filters: CompanyFilterParams = {}) {
  return useQuery<PagedCompanies, Error>({
    queryKey: companiesKeys.list(filters),
    queryFn: ({ signal }) => companiesService.getPublicCompanies(filters, signal),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
