import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SavedJobsTable } from '../saved-jobs-table';
import type { SavedJobResponse } from '@/modules/saved-jobs';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function buildJob(overrides: Partial<SavedJobResponse> = {}): SavedJobResponse {
  return {
    savedJobId: 'saved-1',
    jobId: 'job-1',
    jobTitle: 'Backend Engineer',
    companyName: 'Acme Corp',
    location: 'Dhaka, Bangladesh',
    employmentType: 'FullTime',
    postedDate: '2026-08-15T00:00:00Z',
    isAvailable: true,
    ...overrides,
  };
}

describe('SavedJobsTable', () => {
  const onRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state', () => {
    render(
      <SavedJobsTable savedJobs={[]} isLoading isError={false} onRemove={onRemove} />
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an error state', () => {
    render(
      <SavedJobsTable savedJobs={[]} isLoading={false} isError onRemove={onRemove} />
    );

    expect(
      screen.getByText("Couldn't load your saved jobs. Please try again.")
    ).toBeInTheDocument();
  });

  it('shows an empty state when there are no saved jobs', () => {
    render(
      <SavedJobsTable savedJobs={[]} isLoading={false} isError={false} onRemove={onRemove} />
    );

    expect(
      screen.getByText('No saved jobs yet. Bookmark a role to find it here later.')
    ).toBeInTheDocument();
  });

  it('renders company, role, employment type, posted date and location for each job', () => {
    const job = buildJob();
    render(
      <SavedJobsTable savedJobs={[job]} isLoading={false} isError={false} onRemove={onRemove} />
    );

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    const titleLink = screen.getByRole('link', { name: 'Backend Engineer' });
    expect(titleLink).toHaveAttribute('href', '/jobs/job-1');
    expect(screen.getByText('Full Time')).toBeInTheDocument();
    expect(screen.getByText('Dhaka, Bangladesh')).toBeInTheDocument();
    expect(screen.getByText('2026-08-15')).toBeInTheDocument();
  });

  it('does not show the unavailable indicator for an available job', () => {
    render(
      <SavedJobsTable
        savedJobs={[buildJob({ isAvailable: true })]}
        isLoading={false}
        isError={false}
        onRemove={onRemove}
      />
    );

    expect(screen.queryByText('This job is no longer available')).not.toBeInTheDocument();
  });

  it('shows the unavailable popup text for an unavailable job, still keeping the posted date', () => {
    render(
      <SavedJobsTable
        savedJobs={[buildJob({ isAvailable: false, postedDate: '2026-08-15T00:00:00Z' })]}
        isLoading={false}
        isError={false}
        onRemove={onRemove}
      />
    );

    expect(screen.getByText('This job is no longer available')).toBeInTheDocument();
    expect(screen.getByText('2026-08-15')).toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
  });

  it('navigates to the job details page when the row is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SavedJobsTable savedJobs={[buildJob()]} isLoading={false} isError={false} onRemove={onRemove} />
    );

    await user.click(screen.getByText('Acme Corp'));
    expect(mockPush).toHaveBeenCalledWith('/jobs/job-1');
  });

  it('opens a confirmation dialog when the bookmark action is clicked, without navigating', async () => {
    const user = userEvent.setup();
    render(
      <SavedJobsTable savedJobs={[buildJob()]} isLoading={false} isError={false} onRemove={onRemove} />
    );

    await user.click(screen.getByLabelText('Remove Backend Engineer from saved jobs'));

    expect(screen.getByText('Remove saved job?')).toBeInTheDocument();
    expect(
      screen.getByText('"Backend Engineer" will be removed from your saved jobs list. You can always save it again later.')
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('calls onRemove only after Confirm is clicked in the dialog', async () => {
    const user = userEvent.setup();
    render(
      <SavedJobsTable savedJobs={[buildJob()]} isLoading={false} isError={false} onRemove={onRemove} />
    );

    await user.click(screen.getByLabelText('Remove Backend Engineer from saved jobs'));
    await user.click(screen.getByText('Confirm'));

    expect(onRemove).toHaveBeenCalledWith('job-1');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not call onRemove when Cancel is clicked in the dialog', async () => {
    const user = userEvent.setup();
    render(
      <SavedJobsTable savedJobs={[buildJob()]} isLoading={false} isError={false} onRemove={onRemove} />
    );

    await user.click(screen.getByLabelText('Remove Backend Engineer from saved jobs'));
    await user.click(screen.getByText('Cancel'));

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.queryByText('Remove saved job?')).not.toBeInTheDocument();
  });

  it('disables the bookmark action while that job is being removed', () => {
    render(
      <SavedJobsTable
        savedJobs={[buildJob()]}
        isLoading={false}
        isError={false}
        onRemove={onRemove}
        removingJobId="job-1"
      />
    );

    expect(screen.getByLabelText('Remove Backend Engineer from saved jobs')).toBeDisabled();
  });
});
