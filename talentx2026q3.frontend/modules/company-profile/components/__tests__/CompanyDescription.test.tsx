import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CompanyDescription, LONG_DESCRIPTION_THRESHOLD } from '../CompanyDescription';

describe('CompanyDescription', () => {
  it('renders short descriptions as plain justified text without a toggle', () => {
    render(<CompanyDescription description="We build awesome software." />);

    const block = screen.getByText('We build awesome software.');
    expect(block).toHaveClass('text-justify');
    expect(
      screen.queryByRole('button', { name: /company description/i }),
    ).not.toBeInTheDocument();
  });

  it('renders descriptions at exactly the threshold without a toggle', () => {
    render(<CompanyDescription description={'a'.repeat(LONG_DESCRIPTION_THRESHOLD)} />);

    expect(
      screen.queryByRole('button', { name: /company description/i }),
    ).not.toBeInTheDocument();
  });

  it('collapses long descriptions with a fade and expands on Show more', () => {
    const longText = 'Lorem ipsum dolor sit amet. '.repeat(60).trim();
    expect(longText.length).toBeGreaterThan(LONG_DESCRIPTION_THRESHOLD);

    render(<CompanyDescription description={longText} />);

    const block = screen.getByText(longText);
    expect(block).toHaveClass('text-justify');
    expect(block).toHaveClass('max-h-96');
    expect(block).toHaveClass('overflow-hidden');

    const toggle = screen.getByRole('button', {
      name: 'Show more of the company description',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);

    expect(screen.getByText(longText)).not.toHaveClass('max-h-96');
    const expandedToggle = screen.getByRole('button', {
      name: 'Show less of the company description',
    });
    expect(expandedToggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(expandedToggle);
    expect(screen.getByText(longText)).toHaveClass('max-h-96');
    expect(
      screen.getByRole('button', { name: 'Show more of the company description' }),
    ).toBeInTheDocument();
  });
});
