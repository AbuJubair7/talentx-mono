import React from 'react';
import { render, screen } from '@testing-library/react';

import { JobStatusBadge } from '../JobStatusBadge';

describe('JobStatusBadge', () => {
  it('renders Active badge with soft blue styling and pulse indicator for Published status', () => {
    const { container } = render(<JobStatusBadge status="Published" />);

    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-700');

    const pulseDot = container.querySelector('span > span');
    expect(pulseDot).toBeInTheDocument();
    expect(pulseDot).toHaveClass('bg-blue-500', 'animate-pulse');
  });

  it('renders Draft badge with amber styling without pulse indicator', () => {
    const { container } = render(<JobStatusBadge status="Draft" />);

    const badge = screen.getByText('Draft');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-50', 'border-amber-200', 'text-amber-700');

    const pulseDot = container.querySelector('span > span');
    expect(pulseDot).not.toBeInTheDocument();
  });

  it('renders Closed badge with slate styling without pulse indicator', () => {
    const { container } = render(<JobStatusBadge status="Closed" />);

    const badge = screen.getByText('Closed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-100', 'border-slate-200', 'text-slate-500');

    const pulseDot = container.querySelector('span > span');
    expect(pulseDot).not.toBeInTheDocument();
  });

  it('renders Expired badge with rose styling without pulse indicator', () => {
    const { container } = render(<JobStatusBadge status="Expired" />);

    const badge = screen.getByText('Expired');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-rose-50', 'border-rose-200', 'text-rose-700');

    const pulseDot = container.querySelector('span > span');
    expect(pulseDot).not.toBeInTheDocument();
  });

  it('renders Deactivated badge with rose styling', () => {
    const { container } = render(<JobStatusBadge status="Deactivated" />);

    const badge = screen.getByText('Deactivated');
    expect(badge).toHaveClass('bg-rose-50', 'border-rose-300', 'text-rose-800');
    expect(container.querySelector('span > span')).not.toBeInTheDocument();
  });

  it('renders PendingReview as "Under review" with amber styling', () => {
    const { container } = render(<JobStatusBadge status="PendingReview" />);

    // The employer should never see the API's enum name.
    const badge = screen.getByText('Under review');
    expect(badge).toHaveClass('bg-amber-50', 'border-amber-300', 'text-amber-800');
    expect(screen.queryByText('PendingReview')).not.toBeInTheDocument();
    expect(container.querySelector('span > span')).not.toBeInTheDocument();
  });

  it('merges custom className with default pill classes', () => {
    render(<JobStatusBadge status="Published" className="custom-class" />);

    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('custom-class', 'rounded-full', 'border', 'px-2.5', 'py-0.5');
  });
});
