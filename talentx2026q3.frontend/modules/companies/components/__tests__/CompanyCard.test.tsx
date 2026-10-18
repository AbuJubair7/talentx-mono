import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompanyCard } from '../CompanyCard';
import type { CompanyListItem } from '../../types/company-list.types';

describe('CompanyCard', () => {
  const companyId = '11111111-1111-1111-1111-111111111111';
  const mockCompany: CompanyListItem = {
    id: companyId,
    name: 'Apex Innovations',
    logoUrl: null,
    description: 'We innovate in cloud AI and modern infrastructure.',
    industry: 'Technology & Software',
    companySize: '51-200',
    website: 'https://apex.example.com',
    location: 'Austin, TX',
    linkedIn: 'https://linkedin.com/company/apex',
    twitter: null,
    facebook: null,
    openingsCount: 3,
    vacanciesCount: 7,
  };

  it('renders a clickable row with info, tags, counts, and profile overlay link', () => {
    render(<CompanyCard company={mockCompany} />);

    expect(screen.getByText('Apex Innovations')).toBeInTheDocument();
    expect(screen.getAllByText('Technology & Software').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Austin, TX')).toBeInTheDocument();
    expect(screen.getByText('51-200 employees')).toBeInTheDocument();
    expect(screen.getByText(/We innovate in cloud AI/i)).toBeInTheDocument();
    expect(screen.getByLabelText('3 openings')).toBeInTheDocument();
    expect(screen.getByLabelText('7 vacancies')).toBeInTheDocument();

    // Entire row acts as the company link; no separate buttons.
    const overlayLink = screen.getByRole('link', { name: /View Apex Innovations profile/i });
    expect(overlayLink).toHaveAttribute('href', `/companies/${companyId}`);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders singular opening/vacancy labels and fallback logo without logoUrl', () => {
    render(
      <CompanyCard
        company={{ ...mockCompany, openingsCount: 1, vacanciesCount: 1 }}
      />,
    );

    expect(screen.getByLabelText('1 opening')).toBeInTheDocument();
    expect(screen.getByLabelText('1 vacancy')).toBeInTheDocument();
    expect(screen.getByTestId('default-company-logo')).toBeInTheDocument();
  });

  it('shows a verified badge when the company has a logo and website', () => {
    render(
      <CompanyCard company={{ ...mockCompany, logoUrl: 'https://cdn.example/logo.png' }} />,
    );

    expect(screen.getByText('Verified company')).toBeInTheDocument();
  });
});
