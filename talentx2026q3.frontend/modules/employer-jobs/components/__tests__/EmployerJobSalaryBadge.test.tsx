import React from 'react';
import { render, screen } from '@testing-library/react';

import { EmployerJobSalaryBadge } from '../EmployerJobSalaryBadge';

describe('EmployerJobSalaryBadge', () => {
  it('renders formatted salary range with amber badge styling and banknote icon', () => {
    const { container } = render(
      <EmployerJobSalaryBadge
        salaryType="Range"
        salaryMin={80000}
        salaryMax={120000}
        salaryCurrency="BDT"
        salaryPeriod="PerMonth"
      />
    );

    const badge = screen.getByText('80,000-120,000 BDT/month');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-50', 'border-amber-200', 'text-amber-800');

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-amber-600');
  });

  it('renders fixed salary as a single amount', () => {
    render(
      <EmployerJobSalaryBadge
        salaryType="Fixed"
        salaryMin={80000}
        salaryMax={80000}
        salaryCurrency="BDT"
        salaryPeriod="PerMonth"
      />
    );

    expect(screen.getByText('80,000 BDT/month')).toBeInTheDocument();
  });

  it('renders Negotiable fallback when salary is missing', () => {
    render(<EmployerJobSalaryBadge salaryType="Negotiable" />);

    expect(screen.getByText('Negotiable')).toBeInTheDocument();
  });

  it('merges custom className with default badge classes', () => {
    render(<EmployerJobSalaryBadge salaryType="Negotiable" className="custom-class" />);

    const badge = screen.getByText('Negotiable');
    expect(badge).toHaveClass('custom-class', 'inline-flex', 'rounded-md');
  });
});
