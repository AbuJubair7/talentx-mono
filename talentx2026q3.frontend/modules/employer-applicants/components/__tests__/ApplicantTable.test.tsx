import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicantTable } from '../ApplicantTable';
import type { JobApplicant } from '../../types/applicant.types';

describe('ApplicantTable', () => {
  const applicants: JobApplicant[] = [
    {
      id: 'app-1',
      jobId: 'job-1',
      talentUserId: 't-1',
      applicantName: 'Alice Johnson',
      applicantEmail: 'alice@example.com',
      resumeDownloadUrl: null,
      status: 'Applied',
      aiMatchScore: 85,
      expectedSalary: 90000,
      totalYearsExperience: 4,
      location: 'NYC',
      appliedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'app-2',
      jobId: 'job-1',
      talentUserId: 't-2',
      applicantName: 'Bob Miller',
      applicantEmail: 'bob@example.com',
      resumeDownloadUrl: 'https://storage.test/bob.pdf',
      status: 'Interview',
      aiMatchScore: 78,
      expectedSalary: 105000,
      totalYearsExperience: 7,
      location: 'LA',
      appliedAt: '2026-09-02T00:00:00Z',
    },
  ];

  const onToggleSelectAll = jest.fn();
  const onToggleSelect = jest.fn();
  const onOpenProfile = jest.fn();
  const onStatusChange = jest.fn();
  const onSort = jest.fn();
  const sortConfig = { sortBy: 'aiMatchScore', sortOrder: 'desc' as const };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders table headers and applicant rows', () => {
    render(
      <ApplicantTable
        applicants={applicants}
        selectedIds={new Set(['app-1'])}
        onToggleSelectAll={onToggleSelectAll}
        onToggleSelect={onToggleSelect}
        onOpenProfile={onOpenProfile}
        onStatusChange={onStatusChange}
        pendingStatusIds={new Set()}
        isFetching={false}
        sortConfig={sortConfig}
        onSort={onSort}
      />
    );

    expect(screen.getByText('Candidate')).toBeInTheDocument();
    expect(screen.getByText('AI Match')).toBeInTheDocument();
    expect(screen.getByText('Applied Date')).toBeInTheDocument();
    expect(screen.getAllByText('Resume').length).toBeGreaterThan(0);
    expect(screen.getByText('Status')).toBeInTheDocument();

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Bob Miller')).toBeInTheDocument();
  });

  it('calls onToggleSelectAll when header select all checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ApplicantTable
        applicants={applicants}
        selectedIds={new Set()}
        onToggleSelectAll={onToggleSelectAll}
        onToggleSelect={onToggleSelect}
        onOpenProfile={onOpenProfile}
        onStatusChange={onStatusChange}
        pendingStatusIds={new Set()}
        isFetching={false}
        sortConfig={sortConfig}
        onSort={onSort}
      />
    );

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all applicants/i });
    await user.click(selectAllCheckbox);

    expect(onToggleSelectAll).toHaveBeenCalledTimes(1);
  });
});
