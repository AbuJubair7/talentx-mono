import { renderHook, waitFor } from '@testing-library/react';

import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';

import { usePublicCompanies } from '../usePublicCompanies';
import { companiesService } from '../../services/companies.service';

jest.mock('../../services/companies.service', () => ({
  companiesService: {
    getPublicCompanies: jest.fn(),
  },
}));

const mockedService = companiesService as jest.Mocked<typeof companiesService>;

describe('usePublicCompanies', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('passes filters to the service and returns the paged result', async () => {
    const paged = {
      items: [],
      page: 1,
      pageSize: 12,
      totalCount: 0,
      totalPages: 0,
      totalOpenings: 0,
      totalVacancies: 0,
    };
    mockedService.getPublicCompanies.mockResolvedValueOnce(paged);

    const filters = { keyword: 'acme', page: 1, pageSize: 12 } as const;
    const { result } = renderHook(() => usePublicCompanies(filters), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedService.getPublicCompanies).toHaveBeenCalledWith(
      filters,
      expect.anything()
    );
    expect(result.current.data).toEqual(paged);
  });

  it('surfaces query errors', async () => {
    mockedService.getPublicCompanies.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePublicCompanies({}), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
