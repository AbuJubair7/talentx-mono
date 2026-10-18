import React from 'react';
import { render, screen } from '@testing-library/react';
import PublicCompanyPage, { generateMetadata } from '@/app/(public)/companies/[slug]/page';
import { companyProfileService } from '@/modules/company-profile';
import { getSession } from '@/lib/auth/session';
import { UserRole } from '@/types/auth';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';

jest.mock('@/modules/company-profile', () => {
  const original = jest.requireActual('@/modules/company-profile');
  return {
    ...original,
    companyProfileService: {
      getPublicCompanyProfile: jest.fn(),
    },
  };
});

jest.mock('@/lib/auth/session', () => ({
  getSession: jest.fn(),
}));

jest.mock('@/components/common/header', () => ({
  Header: () => <header data-testid="mock-header">Header</header>,
}));

jest.mock('@/components/common/footer', () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

describe('PublicCompanyPage Route', () => {
  const mockPublicCompany = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Acme Technologies',
    logoUrl: null,
    description: 'Leading AI and cloud engineering company.',
    industry: 'Technology & Software',
    companySize: '51-200',
    website: 'https://acme.example.com',
    location: 'San Francisco, CA',
    linkedIn: 'https://linkedin.com/company/acme',
    twitter: null,
    facebook: null,
    activeJobsCount: 1,
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
        id: 'job-101',
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
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(null);
    (companyProfileService.getPublicCompanyProfile as jest.Mock).mockResolvedValue(mockPublicCompany);
  });

  it('generates dynamic SEO metadata', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'acme-technologies' }),
    });

    expect(meta.title).toContain('Acme Technologies');
    expect(meta.description).toContain('Leading AI and cloud engineering');
  });

  it('renders public company page with header, footer, and company information without login', async () => {
    const pageElement = await PublicCompanyPage({
      params: Promise.resolve({ slug: 'acme-technologies' }),
    });

    render(pageElement, { wrapper: createQueryWrapper() });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Acme Technologies' })).toBeInTheDocument();
    expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument();
  });
});
