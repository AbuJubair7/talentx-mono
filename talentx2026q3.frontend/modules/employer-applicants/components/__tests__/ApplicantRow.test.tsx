import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicantRow } from '../ApplicantRow';
import type { JobApplicant } from '../../types/applicant.types';

// The real Select is a Base UI popover: its options only mount into an accessible
// (non-`hidden`) DOM node after an open animation that jsdom does not settle in tests.
// Mocking it lets us assert which options a trigger renders without fighting that lifecycle.
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button" role="combobox" aria-expanded="false" aria-controls="mock-select-list">
      {children}
    </button>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div id="mock-select-list">{children}</div>,
  SelectItem: ({ children, value, disabled }: { children: React.ReactNode; value: string; disabled?: boolean }) => (
    <div role="option" aria-selected="false" aria-disabled={disabled ?? false} data-value={value}>{children}</div>
  ),
}));

describe('ApplicantRow', () => {
  const applicant: JobApplicant = {
    id: 'app-1',
    jobId: 'job-100',
    talentUserId: 'talent-1',
    applicantName: 'Emily Watson',
    applicantEmail: 'emily@example.com',
    resumeDownloadUrl: 'https://storage.test/emily_cv.pdf',
    status: 'Applied',
    aiMatchScore: 92,
    expectedSalary: 110000,
    totalYearsExperience: 6,
    location: 'Chicago, IL',
    appliedAt: '2026-09-02T12:00:00Z',
  };

  const onToggleSelect = jest.fn();
  const onOpenProfile = jest.fn();
  const onStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (isSelected = false, isStatusPending = false) => {
    return render(
      <table>
        <tbody>
          <ApplicantRow
            applicant={applicant}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
            onOpenProfile={onOpenProfile}
            onStatusChange={onStatusChange}
            isStatusPending={isStatusPending}
          />
        </tbody>
      </table>
    );
  };

  it('renders candidate details, resume link, applied date, and AI score', () => {
    renderComponent();

    expect(screen.getByText('Emily Watson')).toBeInTheDocument();
    expect(screen.getByText('emily@example.com')).toBeInTheDocument();
    expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Sep 2, 2026')).toBeInTheDocument();

    const resumeLink = screen.getByRole('link', { name: /resume/i });
    expect(resumeLink).toHaveAttribute('href', 'https://storage.test/emily_cv.pdf');
  });

  it('calls onToggleSelect when checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderComponent(false);

    const checkbox = screen.getByRole('checkbox', { name: /select emily watson/i });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(onToggleSelect).toHaveBeenCalledWith('app-1');
  });

  it('calls onOpenProfile when candidate name is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameBtn = screen.getByText('Emily Watson');
    await user.click(nameBtn);

    expect(onOpenProfile).toHaveBeenCalledWith('app-1');
  });

  it('mutes the Applied option for an already-applied applicant', () => {
    renderComponent();

    const options = screen.getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'Applied',
      'Shortlisted',
      'Hired',
      'Rejected',
    ]);
    expect(options[0]).toHaveAttribute('aria-disabled', 'true');
    expect(options[1]).toHaveAttribute('aria-disabled', 'false');
    expect(options[2]).toHaveAttribute('aria-disabled', 'false');
    expect(options[3]).toHaveAttribute('aria-disabled', 'false');
    expect(options.map((option) => option.textContent)).not.toContain('PendingVerification');
    expect(options.map((option) => option.textContent)).not.toContain('Reviewed');
    expect(options.map((option) => option.textContent)).not.toContain('Interview');
    expect(options.map((option) => option.textContent)).not.toContain('Invited');
  });

  it('keeps the Applied option hidden for non-revertible statuses', () => {
    render(
      <table>
        <tbody>
          <ApplicantRow
            applicant={{ ...applicant, status: 'Interview' }}
            isSelected={false}
            onToggleSelect={onToggleSelect}
            onOpenProfile={onOpenProfile}
            onStatusChange={onStatusChange}
            isStatusPending={false}
          />
        </tbody>
      </table>
    );

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['Shortlisted', 'Hired', 'Rejected']);
  });

  it('offers Applied as a revert option for shortlisted applicants', () => {
    render(
      <table>
        <tbody>
          <ApplicantRow
            applicant={{ ...applicant, status: 'Shortlisted' }}
            isSelected={false}
            onToggleSelect={onToggleSelect}
            onOpenProfile={onOpenProfile}
            onStatusChange={onStatusChange}
            isStatusPending={false}
          />
        </tbody>
      </table>
    );

    const options = screen.getAllByRole('option').map((option) => option.textContent);
    expect(options).toEqual(['Applied', 'Shortlisted', 'Hired', 'Rejected']);
  });

  it('disables the already-selected status option', () => {
    render(
      <table>
        <tbody>
          <ApplicantRow
            applicant={{ ...applicant, status: 'Shortlisted' }}
            isSelected={false}
            onToggleSelect={onToggleSelect}
            onOpenProfile={onOpenProfile}
            onStatusChange={onStatusChange}
            isStatusPending={false}
          />
        </tbody>
      </table>
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveAttribute('aria-disabled', 'false');
    expect(options[1]).toHaveAttribute('aria-disabled', 'true');
    expect(options[2]).toHaveAttribute('aria-disabled', 'false');
    expect(options[3]).toHaveAttribute('aria-disabled', 'false');
  });

  it('renders "No CV" when resumeDownloadUrl is null', () => {
    const noCvApplicant = { ...applicant, resumeDownloadUrl: null };
    render(
      <table>
        <tbody>
          <ApplicantRow
            applicant={noCvApplicant}
            isSelected={false}
            onToggleSelect={onToggleSelect}
            onOpenProfile={onOpenProfile}
            onStatusChange={onStatusChange}
            isStatusPending={false}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('No CV')).toBeInTheDocument();
  });
});
