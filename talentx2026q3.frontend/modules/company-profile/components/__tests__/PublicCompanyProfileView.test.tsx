import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublicCompanyProfileView } from '../PublicCompanyProfileView';
import type { PublicCompanyProfileDto } from '../../types/company-profile.types';

jest.mock('@/modules/company-review', () => ({
  CompanyReviewsSection: () => React.createElement('div', { 'data-testid': 'company-reviews-section' }),
}));

describe('PublicCompanyProfileView', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  const mockPublicCompany: PublicCompanyProfileDto = {
    id: '11111111-1111-1111-1111-111111111111',
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
    activeJobsCount: 2,
    reviewSummary: {
      totalCount: 0,
      positiveCount: 0,
      negativeCount: 0,
      positivePercent: 0,
      recruitmentProcess: { average: null, ratingCount: 0 },
      communication: { average: null, ratingCount: 0 },
      interviewExperience: { average: null, ratingCount: 0 },
      professionalism: { average: null, ratingCount: 0 },
    },
    publishedJobs: [
      {
        id: 'job-1',
        title: 'Full Stack Engineer',
        location: 'Remote',
        city: null,
        country: null,
        employmentType: 'FullTime',
        experienceLevel: 'Senior',
        workArrangement: 'Remote',
        vacancies: 1,
        expireAt: '2027-01-01T00:00:00.000Z',
        publishedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'job-2',
        title: 'Product Manager',
        location: 'Austin, TX',
        city: null,
        country: null,
        employmentType: 'FullTime',
        experienceLevel: 'MidLevel',
        workArrangement: 'Hybrid',
        vacancies: 1,
        expireAt: '2027-01-01T00:00:00.000Z',
        publishedAt: '2026-08-05T00:00:00.000Z',
      },
    ],
  };

  it('renders company information, badges, website, and social links', () => {
    render(<PublicCompanyProfileView company={mockPublicCompany} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Apex Innovations' })).toBeInTheDocument();
    expect(screen.getByText('Technology & Software')).toBeInTheDocument();
    expect(screen.getByText('51-200 employees')).toBeInTheDocument();
    expect(screen.getAllByText('Austin, TX').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/We innovate in cloud AI/i)).toBeInTheDocument();

    const websiteBtn = screen.getByRole('link', { name: /Visit Website/i });
    expect(websiteBtn).toHaveAttribute('href', 'https://apex.example.com');

    expect(screen.getByLabelText('LinkedIn')).toHaveAttribute('href', 'https://linkedin.com/company/apex');
  });

  it('renders the reviews section behind the Reviews tab and syncs URL', async () => {
    render(<PublicCompanyProfileView company={mockPublicCompany} />);

    expect(screen.queryByTestId('company-reviews-section')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Reviews' }));

    expect(screen.getByTestId('company-reviews-section')).toBeInTheDocument();
    expect(window.location.search).toBe('?tab=reviews');
  });

  it('opens directly to Reviews tab when URL query contains ?tab=reviews', () => {
    window.history.replaceState(null, '', '/company/123?tab=reviews');
    render(<PublicCompanyProfileView company={mockPublicCompany} />);

    expect(screen.getByTestId('company-reviews-section')).toBeInTheDocument();
  });

  it('renders published active jobs with apply links', () => {
    render(<PublicCompanyProfileView company={mockPublicCompany} />);

    expect(screen.getByRole('tab', { name: 'Open Positions' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Reviews' })).toBeInTheDocument();
    expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();

    const jobLink1 = screen.getByRole('link', { name: 'View Full Stack Engineer and apply' });
    const jobLink2 = screen.getByRole('link', { name: 'View Product Manager and apply' });
    expect(jobLink1).toHaveAttribute('href', '/jobs/job-1');
    expect(jobLink2).toHaveAttribute('href', '/jobs/job-2');
  });

  it('shows Edit Company Profile button when viewer is the owner', () => {
    render(<PublicCompanyProfileView company={mockPublicCompany} isOwner={true} />);

    const editBtn = screen.getByRole('link', { name: /Edit Company Profile/i });
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).toHaveAttribute('href', '/company');
  });

  it('does NOT show Edit button for general public visitors', () => {
    render(<PublicCompanyProfileView company={mockPublicCompany} isOwner={false} />);

    expect(screen.queryByRole('link', { name: /Edit Company Profile/i })).not.toBeInTheDocument();
  });
});
