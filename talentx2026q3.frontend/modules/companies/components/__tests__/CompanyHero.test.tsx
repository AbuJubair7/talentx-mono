import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompanyHero } from '../CompanyHero';

describe('CompanyHero', () => {
  it('renders headline, live-data badge, and real counts', () => {
    render(
      <CompanyHero totalCount={12} totalOpenings={34} totalVacancies={86} isPending={false} />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Actively Hiring/);
    expect(screen.getByText(/Discover 12 verified companies/i)).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('86')).toBeInTheDocument();
  });

  it('shows loading placeholders while pending', () => {
    render(
      <CompanyHero totalCount={0} totalOpenings={0} totalVacancies={0} isPending />,
    );

    expect(screen.getByText(/Loading verified companies/i)).toBeInTheDocument();
  });

  it('uses singular wording for a single company', () => {
    render(
      <CompanyHero totalCount={1} totalOpenings={1} totalVacancies={1} isPending={false} />,
    );

    expect(screen.getByText(/1 verified company with 1 open vacancy across 1 active role/i)).toBeInTheDocument();
  });
});
