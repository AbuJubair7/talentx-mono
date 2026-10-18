import { act, renderHook } from '@testing-library/react';
import { useCompanyFilters } from '../useCompanyFilters';

const mockPush = jest.fn();
let mockQuery = '';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(mockQuery),
}));

describe('useCompanyFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = '';
  });

  it('returns defaults when no query params are present', () => {
    const { result } = renderHook(() => useCompanyFilters());

    expect(result.current.filters).toMatchObject({
      keyword: undefined,
      industry: undefined,
      hiring: undefined,
      sortBy: 'name',
      sortDir: 'asc',
      page: 1,
      pageSize: 12,
    });
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('reads canonical params and legacy q/size aliases', () => {
    mockQuery = 'q=acme&size=11-50&hiring=true';

    const { result } = renderHook(() => useCompanyFilters());

    expect(result.current.filters.keyword).toBe('acme');
    expect(result.current.filters.companySize).toBe('11-50');
    expect(result.current.filters.hiring).toBe(true);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it.each(['abc', '0', '-3', '2.5'])('falls back to page 1 for page=%s', (page) => {
    mockQuery = `page=${page}`;

    const { result } = renderHook(() => useCompanyFilters());

    expect(result.current.filters.page).toBe(1);
  });

  it('falls back to name/asc for unknown sort values', () => {
    mockQuery = 'sortBy=hacked&sortDir=sideways';

    const { result } = renderHook(() => useCompanyFilters());

    expect(result.current.filters.sortBy).toBe('name');
    expect(result.current.filters.sortDir).toBe('asc');
  });

  it('navigates with canonical params and resets the page on setKeyword', () => {
    mockQuery = 'page=3';

    const { result } = renderHook(() => useCompanyFilters());

    act(() => {
      result.current.setKeyword('acme');
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('keyword=acme'),
      expect.anything()
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('page=1'),
      expect.anything()
    );
  });

  it('clearAllFilters navigates back to the base listing path', () => {
    const { result } = renderHook(() => useCompanyFilters());

    act(() => {
      result.current.clearAllFilters();
    });

    expect(mockPush).toHaveBeenCalledWith('/companies', expect.anything());
  });
});
