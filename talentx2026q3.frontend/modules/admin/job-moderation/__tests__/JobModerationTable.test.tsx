import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { formatShortDate } from '@/lib/date';
import { JobModerationTable } from '../components/JobModerationTable';
import type { AdminJobListItem } from '../types/job-moderation';

function createAdminJobFixture(
  overrides: Partial<AdminJobListItem> = {}
): AdminJobListItem {
  return {
    id: 'job-moderation-001',
    title: 'SupercalifragilisticexpialidociousSoftwareArchitecturePlatformEngineeringLead',
    companyName: 'InternationalConsolidatedEnterpriseTechnologySolutionsGroupCorporation',
    employerName: 'AlexanderMaximilianMontgomeryBartholomewTheThird',
    employerEmail: 'extremelylongunbrokenemployeremailaddressforoverflowtesting@corporatedomainexample.com',
    status: 'Published',
    isExpired: false,
    location: 'Remote, Worldwide',
    employmentType: 'FullTime',
    workArrangement: 'Remote',
    applicantCount: 15,
    publishedAt: '2026-09-01T00:00:00Z',
    firstPublishedAt: '2026-09-01T00:00:00Z',
    expireAt: '2026-12-31T00:00:00Z',
    deactivatedAt: null,
    ...overrides,
  };
}

describe('JobModerationTable', () => {
  it('renders loading skeleton rows when isLoading is true', () => {
    const { container } = render(
      <JobModerationTable items={[]} isLoading={true} />
    );

    const skeletonRows = container.querySelectorAll('tbody tr.animate-pulse');
    expect(skeletonRows).toHaveLength(5);
  });

  it('renders error state and handles onRetry when isError is true', () => {
    const mockOnRetry = jest.fn();

    render(
      <JobModerationTable
        items={[]}
        isLoading={false}
        isError={true}
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText("Couldn't load jobs.")).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: 'Try again' });
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when items array is empty and not loading', () => {
    render(<JobModerationTable items={[]} isLoading={false} />);

    expect(screen.getByText('No matching jobs found.')).toBeInTheDocument();
  });

  it('renders job with long strings and verifies cell constraints and title attributes', () => {
    const jobFixture = createAdminJobFixture();
    const mockOnView = jest.fn();

    render(
      <JobModerationTable
        items={[jobFixture]}
        isLoading={false}
        onView={mockOnView}
      />
    );

    const jobTitleParagraph = screen.getByText(jobFixture.title);
    expect(jobTitleParagraph).toHaveClass('truncate');
    expect(jobTitleParagraph).toHaveAttribute('title', jobFixture.title);

    const jobCell = jobTitleParagraph.closest('td');
    expect(jobCell).toBeInTheDocument();
    expect(jobCell).toHaveClass('max-w-[280px]');
    expect(jobCell).toHaveClass('min-w-0');

    const companyParagraph = screen.getByText(jobFixture.companyName);
    expect(companyParagraph).toHaveClass('truncate');
    expect(companyParagraph).toHaveAttribute('title', jobFixture.companyName);

    const employerEmailParagraph = screen.getByText(jobFixture.employerEmail);
    expect(employerEmailParagraph).toHaveClass('truncate');
    expect(employerEmailParagraph).toHaveAttribute('title', jobFixture.employerEmail);

    const employerCell = employerEmailParagraph.closest('td');
    expect(employerCell).toBeInTheDocument();
    expect(employerCell).toHaveClass('max-w-[220px]');
    expect(employerCell).toHaveClass('min-w-0');

    const employerNameParagraph = screen.getByText(jobFixture.employerName);
    expect(employerNameParagraph).toHaveClass('truncate');
    expect(employerNameParagraph).toHaveAttribute('title', jobFixture.employerName);
  });

  it('triggers onView callback when clickable row is clicked or keydown pressed', () => {
    const jobFixture = createAdminJobFixture();
    const mockOnView = jest.fn();

    render(
      <JobModerationTable
        items={[jobFixture]}
        isLoading={false}
        onView={mockOnView}
      />
    );

    const tableRow = screen.getByRole('button', {
      name: `View details for ${jobFixture.title}`,
    });
    fireEvent.click(tableRow);
    expect(mockOnView).toHaveBeenCalledWith(jobFixture.id);

    fireEvent.keyDown(tableRow, { key: 'Enter' });
    expect(mockOnView).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(tableRow, { key: ' ' });
    expect(mockOnView).toHaveBeenCalledTimes(3);
  });

  it('renders account not found fallback when employerName and employerEmail are absent', () => {
    const jobFixtureWithoutEmployer = createAdminJobFixture({
      employerName: '',
      employerEmail: '',
    });

    render(
      <JobModerationTable
        items={[jobFixtureWithoutEmployer]}
        isLoading={false}
      />
    );

    expect(screen.getByText('Account not found')).toBeInTheDocument();
  });

  it('shows only the posting date for a job published once', () => {
    render(<JobModerationTable items={[createAdminJobFixture()]} isLoading={false} />);

    expect(screen.getByText(formatShortDate('2026-09-01T00:00:00Z'))).toBeInTheDocument();
    expect(screen.queryByText(/Relisted/)).not.toBeInTheDocument();
  });

  it('shows the first posting date and a relisted line for a job that went live again', () => {
    const relisted = createAdminJobFixture({
      firstPublishedAt: '2026-09-01T12:00:00Z',
      publishedAt: '2026-10-03T12:00:00Z',
    });

    render(<JobModerationTable items={[relisted]} isLoading={false} />);

    expect(screen.getByText(formatShortDate('2026-09-01T12:00:00Z'))).toBeInTheDocument();
    expect(screen.getByText(`Relisted ${formatShortDate('2026-10-03T12:00:00Z')}`)).toBeInTheDocument();
  });
});
