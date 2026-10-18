import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ApplicantListView } from '../ApplicantListView';
import { useJobApplicants } from '../../hooks/useJobApplicants';
import { useUpdateApplicationStatus } from '../../hooks/useUpdateApplicationStatus';
import { useScoreApplicants } from '../../hooks/useScoreApplicants';
import type { PaginatedApplicantList, JobApplicant } from '../../types/applicant.types';

jest.mock('../../hooks/useJobApplicants');
jest.mock('../../hooks/useUpdateApplicationStatus');
jest.mock('../../hooks/useScoreApplicants');

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('../BulkActionsBar', () => ({
  BulkActionsBar: ({ onBulkStatusChange }: { onBulkStatusChange: (status: string) => void }) => (
    <button type="button" onClick={() => onBulkStatusChange('Applied')}>
      mock-bulk-applied
    </button>
  ),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/modules/employer-interviews', () => ({
  SendInterviewDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="send-interview-dialog" /> : null,
}));

const mockUseJobApplicants = useJobApplicants as jest.Mock;
const mockUseUpdateApplicationStatus = useUpdateApplicationStatus as jest.Mock;
const mockUseScoreApplicants = useScoreApplicants as jest.Mock;

describe('ApplicantListView', () => {
  const jobId = 'job-999';
  const mockMutate = jest.fn();
  const mockMutateAsync = jest.fn();

  const mockApplicant: JobApplicant = {
    id: 'app-10',
    jobId,
    talentUserId: 'talent-10',
    applicantName: 'David Clark',
    applicantEmail: 'david@example.com',
    resumeDownloadUrl: 'https://storage.test/david_resume.pdf',
    status: 'Applied',
    aiMatchScore: 89,
    expectedSalary: 120000,
    totalYearsExperience: 6,
    location: 'Boston, MA',
    appliedAt: '2026-09-03T10:00:00Z',
  };

  const mockPaginatedData: PaginatedApplicantList<JobApplicant> = {
    items: [mockApplicant],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    mockUseScoreApplicants.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it('renders loading skeleton when query is pending', () => {
    mockUseJobApplicants.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<ApplicantListView jobId={jobId} />);
    expect(container.querySelectorAll('.animate-pulse, [class*="skeleton"]').length).toBeGreaterThan(0);
  });

  it('renders error message and retry button on query error', async () => {
    const mockRefetch = jest.fn();
    mockUseJobApplicants.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: { message: 'Failed to fetch applicants' },
      refetch: mockRefetch,
    });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    expect(screen.getByText('Failed to load applicant list')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch applicants')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await user.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders empty state when applicants array is empty', () => {
    mockUseJobApplicants.mockReturnValue({
      data: { items: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 1 },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ApplicantListView jobId={jobId} />);

    expect(screen.getByText('No applications yet')).toBeInTheDocument();
  });

  it('renders search input, applicant table, and pagination controls when applicants exist', async () => {
    mockUseJobApplicants.mockReturnValue({
      data: mockPaginatedData,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ApplicantListView jobId={jobId} />);

    expect(screen.getByPlaceholderText('Search candidate by name or email...')).toBeInTheDocument();
    expect(screen.getByText('David Clark')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('Select candidates to invite them to an interview')).toBeInTheDocument();
  });

  it('hides the helper text and shows the bulk actions bar when candidate is selected', async () => {
    mockUseJobApplicants.mockReturnValue({
      data: mockPaginatedData,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    expect(screen.getByText('Select candidates to invite them to an interview')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /select David Clark/i }));

    expect(screen.queryByText('Select candidates to invite them to an interview')).not.toBeInTheDocument();
    expect(screen.getByText('mock-bulk-applied')).toBeInTheDocument();
  });

  it('triggers search submit when search form is submitted', async () => {
    mockUseJobApplicants.mockReturnValue({
      data: mockPaginatedData,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    const searchInput = screen.getByPlaceholderText('Search candidate by name or email...');
    await user.type(searchInput, 'David');

    const searchBtn = screen.getByRole('button', { name: /^search$/i });
    await user.click(searchBtn);

    expect(mockUseJobApplicants).toHaveBeenCalledWith(
      jobId,
      expect.objectContaining({ search: 'David', page: 1, pageSize: 10 })
    );
  });

  it('navigates to the candidate profile page when candidate name is clicked', async () => {
    mockUseJobApplicants.mockReturnValue({
      data: mockPaginatedData,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    const candidateName = screen.getByText('David Clark');
    await user.click(candidateName);

    expect(mockPush).toHaveBeenCalledTimes(1);
    const target = mockPush.mock.calls[0][0] as string;
    expect(target).toContain(`/job/job-listing/${jobId}/applicants/app-10`);
    expect(target).toContain('sortBy=aiMatchScore');
    expect(target).toContain('sortOrder=desc');
  });

  it('reports scored and reused counts in the success toast', async () => {
    mockUseJobApplicants.mockReturnValue({
      data: mockPaginatedData,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    const mutateAsync = jest.fn().mockResolvedValue({ jobId, scoredCount: 3, reusedCount: 2 });
    mockUseScoreApplicants.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    await user.click(screen.getByRole('button', { name: /score with ai/i }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(
      'Scored 3 applicants with AI. Reused 2 existing scores.'
    );
  });

  it('reports reused-only scoring when nothing needed rescoring', async () => {
    mockUseJobApplicants.mockReturnValue({
      data: mockPaginatedData,
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    const mutateAsync = jest.fn().mockResolvedValue({ jobId, scoredCount: 0, reusedCount: 5 });
    mockUseScoreApplicants.mockReturnValue({ mutateAsync, isPending: false });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    await user.click(screen.getByRole('button', { name: /score with ai/i }));

    expect(toast.success).toHaveBeenCalledWith(
      'No rescoring needed — reused 5 existing AI scores.'
    );
  });

  it('reverts only eligible applicants to Applied in bulk and reports skipped ones', async () => {
    const shortlisted: JobApplicant = {
      ...mockApplicant,
      id: 'app-short',
      applicantName: 'Sarah Short',
      status: 'Shortlisted',
    };
    const applied: JobApplicant = {
      ...mockApplicant,
      id: 'app-applied',
      applicantName: 'Adam Applied',
      status: 'Applied',
    };
    const interviewing: JobApplicant = {
      ...mockApplicant,
      id: 'app-interview',
      applicantName: 'Ivan Interview',
      status: 'Interview',
    };

    mockUseJobApplicants.mockReturnValue({
      data: { items: [shortlisted, applied, interviewing], page: 1, pageSize: 10, totalCount: 3, totalPages: 1 },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    mockMutateAsync.mockResolvedValue({ message: 'ok' });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    await user.click(screen.getByRole('checkbox', { name: /select Sarah Short/i }));
    await user.click(screen.getByRole('checkbox', { name: /select Adam Applied/i }));
    await user.click(screen.getByRole('checkbox', { name: /select Ivan Interview/i }));

    await user.click(screen.getByRole('button', { name: 'mock-bulk-applied' }));

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
    expect(mockMutateAsync).toHaveBeenCalledWith({ applicationId: 'app-short', newStatus: 'Applied' });
    expect(toast.success).toHaveBeenCalledWith(
      '1 application reverted to Applied, 2 skipped (only Shortlisted, Hired, or Rejected can be reverted).'
    );
  });

  it('warns without sending requests when no selected applicant can be reverted to Applied', async () => {
    const applied: JobApplicant = {
      ...mockApplicant,
      id: 'app-applied',
      applicantName: 'Adam Applied',
      status: 'Applied',
    };
    const interviewing: JobApplicant = {
      ...mockApplicant,
      id: 'app-interview',
      applicantName: 'Ivan Interview',
      status: 'Interview',
    };

    mockUseJobApplicants.mockReturnValue({
      data: { items: [applied, interviewing], page: 1, pageSize: 10, totalCount: 2, totalPages: 1 },
      isPending: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const user = userEvent.setup();
    render(<ApplicantListView jobId={jobId} />);

    await user.click(screen.getByRole('checkbox', { name: /select Adam Applied/i }));
    await user.click(screen.getByRole('checkbox', { name: /select Ivan Interview/i }));

    await user.click(screen.getByRole('button', { name: 'mock-bulk-applied' }));

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledWith(
      'No selected applicants can be reverted to Applied (only Shortlisted, Hired, or Rejected).'
    );
  });
});
