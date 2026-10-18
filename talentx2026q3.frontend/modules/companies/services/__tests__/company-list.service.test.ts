import { apiClient } from '@/lib/api/axios';
import { companiesService } from '../companies.service';

jest.mock('@/lib/api/axios', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
  parseApiError: jest.fn((e: unknown) => e),
}));

describe('companiesService.getPublicCompanies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls GET /companies with trimmed filters, page 1 and pageSize 12 by default', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 0 },
    });

    await companiesService.getPublicCompanies({
      keyword: '  acme ',
      industry: 'Technology & Software',
      location: 'Dhaka',
      companySize: '11-50',
      sortBy: 'name',
      sortDir: 'asc',
      page: 1,
    });

    expect(apiClient.get).toHaveBeenCalledWith('/companies', {
      params: {
        keyword: 'acme',
        industry: 'Technology & Software',
        location: 'Dhaka',
        companySize: '11-50',
        sortBy: 'name',
        sortDir: 'asc',
        page: 1,
        pageSize: 12,
      },
      signal: undefined,
    });
  });

  it('maps backend Pascal/camel payload to CompanyListItem with counts', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'c1',
            name: 'Acme',
            logoUrl: 'https://cdn/logo.png',
            description: 'Desc',
            industry: 'Software',
            companySize: '11-50',
            website: 'https://acme.example',
            location: 'Dhaka',
            linkedIn: null,
            twitter: null,
            facebook: null,
            openingsCount: 2,
            vacanciesCount: 5,
          },
        ],
        page: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
        totalOpenings: 20,
        totalVacancies: 55,
      },
    });

    const result = await companiesService.getPublicCompanies({});

    expect(result.totalCount).toBe(1);
    expect(result.totalOpenings).toBe(20);
    expect(result.totalVacancies).toBe(55);
    expect(result.items[0]).toMatchObject({
      id: 'c1',
      name: 'Acme',
      openingsCount: 2,
      vacanciesCount: 5,
    });
  });

  it('falls back to page sums when the backend omits filtered-set totals', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'c1',
            name: 'Acme',
            openingsCount: 2,
            vacanciesCount: 5,
          },
        ],
        page: 2,
        pageSize: 1,
        totalCount: 3,
        totalPages: 3,
      },
    });

    const result = await companiesService.getPublicCompanies({ page: 2, pageSize: 1 });

    expect(result.totalOpenings).toBe(2);
    expect(result.totalVacancies).toBe(5);
  });

  it('throws when GET /companies fails', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(companiesService.getPublicCompanies({})).rejects.toThrow();
  });

  it('falls back to safe sort, page, and pageSize when filters are invalid', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 0 },
    });

    await companiesService.getPublicCompanies({
      sortBy: 'hacked' as never,
      sortDir: 'sideways' as never,
      page: Number('abc'),
      pageSize: 9999,
    });

    expect(apiClient.get).toHaveBeenCalledWith('/companies', {
      params: {
        sortBy: 'name',
        sortDir: 'asc',
        page: 1,
        pageSize: 12,
      },
      signal: undefined,
    });
  });

  it('truncates overlong keywords to the max length', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: { items: [], page: 1, pageSize: 12, totalCount: 0, totalPages: 0 },
    });

    await companiesService.getPublicCompanies({ keyword: `  ${'a'.repeat(150)}  ` });

    const sentParams = (apiClient.get as jest.Mock).mock.calls[0][1].params;
    expect(sentParams.keyword).toHaveLength(100);
  });
});
