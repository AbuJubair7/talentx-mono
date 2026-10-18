import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompanyListView } from '../CompanyListView';
import type { CompanyListItem } from '../../types/company-list.types';

const item: CompanyListItem = {
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
};

const baseResult = {
  items: [item],
  totalCount: 1,
  page: 1,
  pageSize: 12,
};

describe('CompanyListView', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({ matches: true }),
    });
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renders company cards', () => {
    render(
      <CompanyListView
        result={baseResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    );

    expect(screen.getByTestId('company-card-c1')).toBeInTheDocument();
  });

  it('shows a clear-filters empty state when filters are active', () => {
    const onClearAll = jest.fn();
    render(
      <CompanyListView
        result={{ ...baseResult, items: [], totalCount: 0 }}
        hasFilters={true}
        onPageChange={jest.fn()}
        onClearAll={onClearAll}
      />
    );

    expect(screen.getByText('No companies match your filters')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('shows a neutral empty state without filters', () => {
    render(
      <CompanyListView
        result={{ ...baseResult, items: [], totalCount: 0 }}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
      />
    );

    expect(screen.getByText('No companies yet')).toBeInTheDocument();
  });

  it('paginates forward and reports the new page', () => {
    const onPageChange = jest.fn();
    render(
      <CompanyListView
        result={{ ...baseResult, totalCount: 25 }}
        hasFilters={false}
        onPageChange={onPageChange}
        onClearAll={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('dims the grid while a background refetch is running', () => {
    render(
      <CompanyListView
        result={baseResult}
        hasFilters={false}
        onPageChange={jest.fn()}
        onClearAll={jest.fn()}
        isUpdating={true}
      />
    );

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true');
  });
});
