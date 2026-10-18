import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompaniesView } from '../CompaniesView';
import { usePublicCompanies } from '../../hooks/usePublicCompanies';
import { useCompanyFilters } from '../../hooks/useCompanyFilters';

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'mock-inter' }),
}));

jest.mock('../../hooks/usePublicCompanies');
jest.mock('../../hooks/useCompanyFilters');

const mockedUsePublicCompanies = usePublicCompanies as jest.MockedFunction<typeof usePublicCompanies>;
const mockedUseCompanyFilters = useCompanyFilters as jest.MockedFunction<typeof useCompanyFilters>;

const setPage = jest.fn();
const setSort = jest.fn();
const clearFilter = jest.fn();
const clearAllFilters = jest.fn();

const mainPage = {
  items: [
    {
      id: 'c1',
      name: 'Acme Corp',
      logoUrl: null,
      description: 'Desc',
      industry: 'Technology & Software',
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
  pageSize: 12,
  totalCount: 25,
  totalPages: 3,
  totalOpenings: 40,
  totalVacancies: 90,
};

const summaryPage = {
  items: [],
  page: 1,
  pageSize: 1,
  totalCount: 100,
  totalPages: 100,
  totalOpenings: 200,
  totalVacancies: 500,
};

function mockHooks(main: unknown) {
  mockedUseCompanyFilters.mockReturnValue({
    filters: { keyword: 'acme', sortBy: 'name', sortDir: 'asc', page: 1, pageSize: 12 },
    hasActiveFilters: true,
    setKeyword: jest.fn(),
    setSearch: jest.fn(),
    setIndustry: jest.fn(),
    setLocation: jest.fn(),
    setCompanySize: jest.fn(),
    setHiring: jest.fn(),
    applyFilters: jest.fn(),
    setSort,
    setPage,
    clearFilter,
    clearAllFilters,
    PAGE_SIZE: 12,
  } as unknown as ReturnType<typeof useCompanyFilters>);

  mockedUsePublicCompanies.mockImplementation(((filters: { pageSize?: number }) =>
    filters?.pageSize === 1
      ? { data: summaryPage, isPending: false }
      : main) as unknown as typeof usePublicCompanies);
}

describe('CompaniesView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    });
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    mockHooks({
      data: mainPage,
      isPending: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('renders the company list with hero totals and active filter pills', () => {
    render(<CompaniesView />);

    expect(screen.getByTestId('company-card-c1')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove keyword filter' })).toBeInTheDocument();
  });

  it('removes a filter when its pill is clicked', () => {
    render(<CompaniesView />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove keyword filter' }));
    expect(clearFilter).toHaveBeenCalledWith('keyword');
  });

  it('advances the page from the list pagination', () => {
    render(<CompaniesView />);

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(setPage).toHaveBeenCalledWith(2);
  });

  it('flips the sort direction when the toggle is clicked', () => {
    render(<CompaniesView />);

    fireEvent.click(screen.getByRole('button', { name: 'Sort highest to lowest' }));
    expect(setSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('shows an error panel with retry when the list query fails', () => {
    const refetch = jest.fn();
    mockHooks({
      data: undefined,
      isPending: false,
      isFetching: false,
      isError: true,
      error: new Error('Server down'),
      refetch,
    });

    render(<CompaniesView />);

    expect(screen.getByText("Couldn't load companies")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
