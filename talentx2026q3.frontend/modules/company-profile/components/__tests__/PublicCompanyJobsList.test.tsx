import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PublicCompanyJobsList } from '../PublicCompanyJobsList';
import type { CompanyPublicJobItem } from '../../types/company-profile.types';

const DAY_MS = 86_400_000;
const NOW = Date.now();

function buildJob(overrides: Partial<CompanyPublicJobItem> = {}): CompanyPublicJobItem {
  return {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    location: 'Dhaka, Bangladesh',
    city: null,
    country: null,
    employmentType: 'FullTime',
    workArrangement: 'FullRemote',
    experienceLevel: 'SeniorLevel',
    vacancies: 3,
    expireAt: new Date(NOW + 30 * DAY_MS).toISOString(),
    publishedAt: new Date(NOW - 60 * DAY_MS).toISOString(),
    ...overrides,
  };
}

describe('PublicCompanyJobsList', () => {
  it('renders the empty state when there are no openings', () => {
    render(<PublicCompanyJobsList jobs={[]} companyName="Acme" />);

    expect(screen.getByText('No Open Vacancies Right Now')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse All Jobs' })).toHaveAttribute('href', '/jobs');
  });

  it('renders a whole-card link, pills, vacancies, and deadline for each job', () => {
    const job = buildJob();
    render(<PublicCompanyJobsList jobs={[job]} companyName="Acme" />);

    const card = screen.getByTestId('company-job-item-job-1');
    expect(
      within(card).getByRole('link', { name: 'View Senior Frontend Engineer and apply' }),
    ).toHaveAttribute('href', '/jobs/job-1');

    expect(within(card).getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(within(card).getByText('Full Remote')).toBeInTheDocument();
    expect(within(card).getByText('Full Time')).toBeInTheDocument();
    expect(within(card).getByText('Senior Level')).toBeInTheDocument();
    expect(within(card).queryByText('FullRemote')).not.toBeInTheDocument();
    expect(within(card).queryByText('FullTime')).not.toBeInTheDocument();
    expect(within(card).queryByText('SeniorLevel')).not.toBeInTheDocument();
    expect(within(card).getByText('3 vacancies')).toBeInTheDocument();
    expect(within(card).getByText(/Apply by/)).toBeInTheDocument();
    // Neither fresh nor urgent for these dates.
    expect(within(card).queryByText('New')).not.toBeInTheDocument();
    expect(within(card).queryByText(/Closes/)).not.toBeInTheDocument();
  });

  it('shows New and Closing soon badges for fresh, urgent jobs', () => {
    const job = buildJob({
      id: 'job-2',
      publishedAt: new Date(NOW - 2 * DAY_MS).toISOString(),
      expireAt: new Date(NOW + 3 * DAY_MS).toISOString(),
      vacancies: 1,
    });
    render(<PublicCompanyJobsList jobs={[job]} companyName="Acme" />);

    const card = screen.getByTestId('company-job-item-job-2');
    expect(within(card).getByText('New')).toBeInTheDocument();
    expect(within(card).getByText('Closes in 3 days')).toBeInTheDocument();
    expect(within(card).getByText('1 vacancy')).toBeInTheDocument();
    expect(within(card).getByText(/Posted 2 days ago/)).toBeInTheDocument();
  });

  it('paginates jobs with previous/next controls', () => {
    const jobs = Array.from({ length: 7 }, (_, index) =>
      buildJob({ id: `job-${index + 1}`, title: `Job ${index + 1}` }),
    );
    render(<PublicCompanyJobsList jobs={jobs} companyName="Acme" />);

    // First page shows 5 of 7 jobs.
    expect(screen.getByText('Job 1')).toBeInTheDocument();
    expect(screen.getByText('Job 5')).toBeInTheDocument();
    expect(screen.queryByText('Job 6')).not.toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: 'Next page' });
    const prevButton = screen.getByRole('button', { name: 'Previous page' });
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    expect(screen.queryByText('Job 1')).not.toBeInTheDocument();
    expect(screen.getByText('Job 6')).toBeInTheDocument();
    expect(screen.getByText('Job 7')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
  });

  it('hides pagination when all jobs fit on one page and respects a custom page size', () => {
    const jobs = Array.from({ length: 3 }, (_, index) =>
      buildJob({ id: `job-${index + 1}`, title: `Job ${index + 1}` }),
    );
    const { rerender } = render(<PublicCompanyJobsList jobs={jobs} companyName="Acme" />);
    expect(screen.queryByRole('navigation', { name: 'Open positions pagination' })).not.toBeInTheDocument();

    rerender(<PublicCompanyJobsList jobs={jobs} companyName="Acme" pageSize={2} />);
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.queryByText('Job 3')).not.toBeInTheDocument();
  });

  it('falls back to city/country location and hides empty meta', () => {
    const job = buildJob({
      location: '',
      city: 'Chattogram',
      country: 'Bangladesh',
      experienceLevel: '',
      workArrangement: '',
      vacancies: 0,
      publishedAt: null,
      expireAt: new Date(NOW - DAY_MS).toISOString(),
    });
    render(<PublicCompanyJobsList jobs={[job]} companyName="Acme" />);

    const card = screen.getByTestId('company-job-item-job-1');
    expect(within(card).getByText('Chattogram, Bangladesh')).toBeInTheDocument();
    expect(within(card).queryByText(/vacancies?/)).not.toBeInTheDocument();
    expect(within(card).queryByText(/Posted/)).not.toBeInTheDocument();
    expect(within(card).queryByText(/Apply by/)).not.toBeInTheDocument();
  });
});
