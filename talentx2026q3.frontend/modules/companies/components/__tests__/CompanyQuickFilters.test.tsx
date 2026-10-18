import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CompanyQuickFilters, resolveActiveChip } from '../CompanyQuickFilters';

describe('resolveActiveChip', () => {
  it('returns all when no filters are set', () => {
    expect(resolveActiveChip({})).toBe('all');
    expect(resolveActiveChip({ sortBy: 'name', sortDir: 'asc' })).toBe('all');
  });

  it('reflects sort presets when no attribute filters are set', () => {
    expect(resolveActiveChip({ sortBy: 'vacancies', sortDir: 'desc' })).toBe('vacancies');
    expect(resolveActiveChip({ sortBy: 'openings', sortDir: 'desc' })).toBe('openings');
  });

  it('reflects location, industry, and size filters', () => {
    expect(resolveActiveChip({ location: 'Remote' })).toBe('remote');
    expect(resolveActiveChip({ industry: 'Technology & Software' })).toBe('software');
    expect(resolveActiveChip({ industry: 'Finance & Banking' })).toBe('finance');
    expect(resolveActiveChip({ industry: 'Healthcare & Life Sciences' })).toBe('health');
    expect(resolveActiveChip({ companySize: '1000+' })).toBe('enterprise');
  });

  it('returns null for unrecognized combinations', () => {
    expect(resolveActiveChip({ keyword: 'acme' })).toBeNull();
    expect(resolveActiveChip({ industry: 'Education & EdTech' })).toBeNull();
  });
});

describe('CompanyQuickFilters', () => {
  it('renders all chips with the live company count and marks the active one', () => {
    render(
      <CompanyQuickFilters totalCount={148} activeChip="all" onSelect={() => {}} />,
    );

    expect(screen.getByText('Companies (148)')).toBeInTheDocument();
    expect(screen.getByText('Most Vacancies')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Companies \(148\)/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Remote' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('notifies the parent when a chip is selected', () => {
    const onSelect = jest.fn();
    render(<CompanyQuickFilters totalCount={12} activeChip={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remote' }));
    expect(onSelect).toHaveBeenCalledWith('remote');

    fireEvent.click(screen.getByRole('button', { name: 'Enterprise' }));
    expect(onSelect).toHaveBeenCalledWith('enterprise');
  });
});
