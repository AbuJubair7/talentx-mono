import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { CompanyFilterDropdown } from '../CompanyFilterDropdown';

const SIZE_OPTIONS = [
  { value: '1-10', label: '1 - 10 employees' },
  { value: '11-50', label: '11 - 50 employees' },
  { value: '1000+', label: '1000+ employees' },
];

describe('CompanyFilterDropdown', () => {
  it('renders the label with the reset entry text when no value is selected', () => {
    render(
      <CompanyFilterDropdown
        label="Size"
        value=""
        allLabel="All Sizes"
        options={SIZE_OPTIONS}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Size filter' })).toHaveTextContent('All Sizes');
    expect(screen.queryByRole('button', { name: 'Clear Size filter' })).not.toBeInTheDocument();
  });

  it('opens a modern popover menu with a group label, reset entry, and options', () => {
    render(
      <CompanyFilterDropdown
        label="Size"
        value=""
        allLabel="All Sizes"
        options={SIZE_OPTIONS}
        onChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Size filter' }));

    const menu = screen.getByRole('listbox');
    expect(within(menu).getByText('Size')).toBeInTheDocument();
    expect(within(menu).getByRole('option', { name: 'All Sizes' })).toBeInTheDocument();
    expect(within(menu).getByRole('option', { name: '1 - 10 employees' })).toBeInTheDocument();
  });

  it('notifies the parent when an option is selected', () => {
    const onChange = jest.fn();
    render(
      <CompanyFilterDropdown
        label="Size"
        value=""
        allLabel="All Sizes"
        options={SIZE_OPTIONS}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Size filter' }));
    const option = screen.getByRole('option', { name: '11 - 50 employees' });
    // Base UI only commits mouse selection after pointerdown on the item.
    fireEvent.pointerDown(option);
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledWith('11-50');
  });

  it('shows the selected label with a clear button that resets the filter', () => {
    const onChange = jest.fn();
    render(
      <CompanyFilterDropdown
        label="Size"
        value="1000+"
        allLabel="All Sizes"
        options={SIZE_OPTIONS}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Size filter' })).toHaveTextContent(
      '1000+ employees',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear Size filter' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('hides the reset entry when showAllOption is false (e.g. Sort)', () => {
    render(
      <CompanyFilterDropdown
        label="Sort"
        value="name:asc"
        defaultValue="name:asc"
        showAllOption={false}
        options={[
          { value: 'name:asc', label: 'Name (A–Z)' },
          { value: 'vacancies:desc', label: 'Most vacancies' },
        ]}
        onChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Sort filter' }));

    const menu = screen.getByRole('listbox');
    expect(
      within(menu).queryByRole('option', { name: 'All' }),
    ).not.toBeInTheDocument();
    expect(
      within(menu).getByRole('option', { name: 'Most vacancies' }),
    ).toBeInTheDocument();
  });
});
