import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CompanySearchFilterBar } from '../CompanySearchFilterBar';

jest.useFakeTimers();

describe('CompanySearchFilterBar', () => {
  const baseFilters = {};

  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('filters live once the user stops typing (no submit needed)', () => {
    const onKeywordChange = jest.fn();
    render(
      <CompanySearchFilterBar
        filters={baseFilters}
        onKeywordChange={onKeywordChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Search by company name/i), {
      target: { value: 'ac' },
    });
    // Still typing — nothing committed yet.
    expect(onKeywordChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Search by company name/i), {
      target: { value: 'acme' },
    });
    jest.advanceTimersByTime(400);

    expect(onKeywordChange).toHaveBeenCalledTimes(1);
    expect(onKeywordChange).toHaveBeenCalledWith('acme');
  });

  it('commits field immediately on Enter', () => {
    const onKeywordChange = jest.fn();
    render(
      <CompanySearchFilterBar
        filters={baseFilters}
        onKeywordChange={onKeywordChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Search by company name/i), {
      target: { value: 'acme' },
    });
    fireEvent.submit(screen.getByRole('search'));

    expect(onKeywordChange).toHaveBeenCalledWith('acme');
  });

  it('clears search via its clear button', () => {
    const onKeywordChange = jest.fn();
    render(
      <CompanySearchFilterBar
        filters={{ keyword: 'acme' }}
        onKeywordChange={onKeywordChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Clear company search'));
    expect(onKeywordChange).toHaveBeenCalledWith('');
  });
});
