import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReportedJobsTable } from '../ReportedJobsTable';
import type { JobReportListItem } from '../../types/job-reports.types';

jest.mock('../JobReportDetailDialog', () => ({
  JobReportDetailDialog: () => <div data-testid="job-report-detail-dialog" />,
}));

jest.mock('../ResolveReportDialog', () => ({
  ResolveReportDialog: () => <div data-testid="resolve-report-dialog" />,
}));

jest.mock('../DismissReportDialog', () => ({
  DismissReportDialog: () => <div data-testid="dismiss-report-dialog" />,
}));

jest.mock('@/modules/admin/job-moderation', () => ({
  JobModerationDetailDialog: () => <div data-testid="job-moderation-detail-dialog" />,
}));

function createReportListItemFixture(
  overrides: Partial<JobReportListItem> = {}
): JobReportListItem {
  return {
    id: 'report-001',
    jobId: 'job-001',
    jobTitle: 'SupercalifragilisticexpialidociousSoftwareArchitecturePlatformEngineeringLead',
    companyName: 'InternationalConsolidatedEnterpriseTechnologySolutionsGroupCorporation',
    reason: 'SuspectedScam',
    reasonLabel: 'SuspectedScamAndFraudulentHiringActivityInvestigationRequired',
    status: 'Pending',
    createdAt: '2026-09-20T12:00:00Z',
    reporterEmail: 'extremelylongunbrokenreporteremailaddressforoverflowtesting@corporatedomainexample.com',
    ...overrides,
  };
}

describe('ReportedJobsTable', () => {
  it('renders loading state when isLoading is true', () => {
    render(<ReportedJobsTable data={[]} isLoading={true} />);

    expect(screen.getByText('Loading reports...')).toBeInTheDocument();
  });

  it('renders empty state message when data is empty and not loading', () => {
    render(<ReportedJobsTable data={[]} isLoading={false} />);

    expect(
      screen.getByText('No reported jobs found matching the current criteria.')
    ).toBeInTheDocument();
  });

  it('renders rows with long unbroken text and verifies overflow and title attributes', () => {
    const reportItemFixture = createReportListItemFixture();

    render(<ReportedJobsTable data={[reportItemFixture]} isLoading={false} />);

    const jobTitleElement = screen.getByText(reportItemFixture.jobTitle);
    expect(jobTitleElement).toHaveClass('line-clamp-2');
    expect(jobTitleElement).toHaveClass('break-words');
    expect(jobTitleElement).toHaveClass('[overflow-wrap:anywhere]');
    expect(jobTitleElement).toHaveAttribute('title', reportItemFixture.jobTitle);

    const companyNameElement = screen.getByText(reportItemFixture.companyName);
    expect(companyNameElement).toHaveClass('truncate');
    expect(companyNameElement).toHaveAttribute('title', reportItemFixture.companyName);

    const reasonLabelElement = screen.getByText(reportItemFixture.reasonLabel);
    expect(reasonLabelElement).toHaveClass('truncate');
    expect(reasonLabelElement).toHaveAttribute('title', reportItemFixture.reasonLabel);

    const reporterEmailElement = screen.getByText(reportItemFixture.reporterEmail!);
    expect(reporterEmailElement).toHaveClass('truncate');
    expect(reporterEmailElement).toHaveAttribute('title', reportItemFixture.reporterEmail);
  });
});
