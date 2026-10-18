import type { CompanyFilterParams } from '../types/company-list.types';

export const companiesKeys = {
  all: ['companies'] as const,
  list: (filters: CompanyFilterParams) => [...companiesKeys.all, 'list', filters] as const,
};
