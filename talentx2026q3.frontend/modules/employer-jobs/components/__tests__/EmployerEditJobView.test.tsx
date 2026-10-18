import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createQueryWrapper } from '@/tests/test-utils/query-client-wrapper';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  generateDescription,
  generateRequirements,
  generateSkills,
} from '@/modules/jobposting/services/job-generation.service';
import { EmployerEditJobView, focusFirstErrorField } from '../EmployerEditJobView';
import { employerJobsService } from '../../services/employer-jobs.service';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@/modules/jobposting/services/job-generation.service', () => ({
  generateSkills: jest.fn(),
  generateDescription: jest.fn(),
  generateRequirements: jest.fn(),
}));

jest.mock('../../services/employer-jobs.service', () => ({
  employerJobsService: {
    getMyJobById: jest.fn(),
    updateJob: jest.fn(),
    closeJob: jest.fn(),
    reopenJob: jest.fn(),
    resubmitJob: jest.fn(),
  },
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) =>
    open ? React.createElement('div', { role: 'dialog' }, children) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h2', null, children),
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement('p', null, children),
  DialogClose: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    type = 'button',
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    React.createElement('button', { onClick, disabled, className, type }, children),
}));

describe('EmployerEditJobView', () => {
  jest.setTimeout(15000);

  const mockPush = jest.fn();
  const mockBack = jest.fn();
  const mockJobId = 'job-123';

  const mockJob = {
    id: mockJobId,
    title: 'Senior Software Engineer',
    companyName: 'TechCorp',
    description: 'A great role for a senior engineer with deep expertise in React.',
    requirements: '5+ years of React experience and strong TypeScript skills.',
    location: 'Dhaka, Bangladesh',
    employmentType: 'FullTime',
    experienceLevel: 'SeniorLevel',
    workArrangement: 'Hybrid',
    city: 'Dhaka',
    country: 'Bangladesh',
    requiredSkills: ['React', 'TypeScript', 'Node.js'],
    vacancies: 2,
    status: 'Draft',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-02T12:00:00Z',
    expireAt: '2026-12-31',
    applicantCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: mockJobId });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  it('renders loading skeleton initially', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockReturnValue(new Promise(() => {}));

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    expect(screen.getByTestId('edit-job-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Employer / Jobs')).not.toBeInTheDocument();
  });

  it('renders 404 state when job is not found', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockRejectedValue(new Error('Not Found'));

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Job posting not found')).toBeInTheDocument();
    });
    expect(screen.getByText('Back to My Jobs')).toBeInTheDocument();
  });

  it('renders form pre-filled with job data across all sections', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('TechCorp')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('A great role for a senior engineer with deep expertise in React.')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dhaka, Bangladesh')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-12-31')).toBeInTheDocument();

    expect(screen.getByText('General Information')).toBeInTheDocument();
    expect(screen.getByText('Role Details & Classification')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Role Description/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Requirements/ })).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('5+ years of React experience and strong TypeScript skills.')
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Required Skills/ })).toBeInTheDocument();
    expect(screen.getByText('Timeline & Expiration')).toBeInTheDocument();

    const skillsList = screen.getByTestId('skills-pill-list');
    expect(within(skillsList).getByText('React')).toBeInTheDocument();
    expect(within(skillsList).getByText('TypeScript')).toBeInTheDocument();
    expect(within(skillsList).getByText('Node.js')).toBeInTheDocument();
  });

  it('updates character counter dynamically when description changes', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    const descriptionInput = screen.getByDisplayValue(
      'A great role for a senior engineer with deep expertise in React.'
    );
    await userEvent.clear(descriptionInput);
    await userEvent.type(descriptionInput, 'Short role summary here.');

    expect(screen.getByText(/24 \/ 10,000 characters/i)).toBeInTheDocument();
  });

  it('allows adding a new skill via text input and Add button', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    const skillInput = screen.getByPlaceholderText(/Add a required skill/i);
    await userEvent.type(skillInput, 'GraphQL');

    const addSkillButton = screen.getByRole('button', { name: /Add/i });
    await userEvent.click(addSkillButton);

    const skillsList = screen.getByTestId('skills-pill-list');
    expect(within(skillsList).getByText('GraphQL')).toBeInTheDocument();
  });

  it('allows adding a skill via Enter key in the skill input field', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    const skillInput = screen.getByPlaceholderText(/Add a required skill/i);
    await userEvent.type(skillInput, 'Docker{enter}');

    const skillsList = screen.getByTestId('skills-pill-list');
    expect(within(skillsList).getByText('Docker')).toBeInTheDocument();
  });

  it('shows no fixed skill suggestions, only typed and AI-generated skills', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Quick suggestions/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Python/i })).not.toBeInTheDocument();
  });

  it('allows removing a skill when clicking the remove button', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    const removeReactButton = screen.getByRole('button', { name: /Remove skill React/i });
    await userEvent.click(removeReactButton);

    expect(screen.queryByRole('button', { name: /Remove skill React/i })).not.toBeInTheDocument();
  });

  it('navigates back to /job/job-listing when Back button or Cancel button is clicked', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /Back to My Jobs/i });
    await userEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith('/job/job-listing');

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);
    expect(mockPush).toHaveBeenCalledWith('/job/job-listing');
  });

  it('calls updateJob with publish: false when "Save as Draft" is clicked', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save as Draft/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save as Draft/i }));

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({ publish: false })
      );
    });

    expect(toast.success).toHaveBeenCalledWith('Job saved as draft');
  });

  it('calls updateJob with publish: true and redirects when "Publish Job" is clicked for draft job', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publish Job/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Publish Job/i }));

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({ publish: true })
      );
      expect(mockPush).toHaveBeenCalledWith('/job/job-listing');
    });

    expect(toast.success).toHaveBeenCalledWith('Job published successfully');
  });

  it('renders "Save Changes" button when job is already Published', async () => {
    const publishedJob = { ...mockJob, status: 'Published' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(publishedJob);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({ publish: false })
      );
    });
  });

  it('displays live job card preview and job details card metadata', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      const livePreviewCard = screen.getByTestId('live-job-card-preview');
      expect(within(livePreviewCard).getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(within(livePreviewCard).getAllByText('TechCorp').length).toBeGreaterThan(0);
      expect(within(livePreviewCard).getByText(/5 applicants/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Job Details & Activity')).toBeInTheDocument();
    expect(screen.getByTitle(mockJobId)).toBeInTheDocument();
  });

  it('matches the live preview card layout with the My Jobs card layout', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('live-job-card-preview')).toBeInTheDocument();
    });

    const livePreviewCard = screen.getByTestId('live-job-card-preview');
    expect(within(livePreviewCard).getByText('Negotiable')).toBeInTheDocument();
    expect(within(livePreviewCard).getByText('Full Time')).toBeInTheDocument();
    expect(within(livePreviewCard).getByText('Experience: Senior Level')).toBeInTheDocument();
    expect(within(livePreviewCard).getByText('Dhaka, Bangladesh')).toBeInTheDocument();
    expect(within(livePreviewCard).getByText('View Details')).toBeInTheDocument();
    expect(within(livePreviewCard).queryByText('Preview Mode')).not.toBeInTheDocument();
  });

  it('shows error toast and validation message when title is cleared before saving as draft', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('Senior Software Engineer');
    await userEvent.clear(titleInput);

    await userEvent.click(screen.getByRole('button', { name: /Save as Draft/i }));

    expect(toast.error).toHaveBeenCalledWith('Job title is required.');
    expect(screen.getByText('Job title is required.')).toBeInTheDocument();
    expect(employerJobsService.updateJob).not.toHaveBeenCalled();
  });

  it('validates city and country for Hybrid or On-Site roles and submits them in updateJob payload', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dhaka')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bangladesh')).toBeInTheDocument();
    });

    const cityInput = screen.getByDisplayValue('Dhaka');
    await userEvent.clear(cityInput);

    await userEvent.click(screen.getByRole('button', { name: /Save as Draft/i }));
    expect(screen.getByText(/City is required for Hybrid and On-Site roles/i)).toBeInTheDocument();
    expect(employerJobsService.updateJob).not.toHaveBeenCalled();

    await userEvent.type(cityInput, 'Chittagong');
    await userEvent.click(screen.getByRole('button', { name: /Save as Draft/i }));

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({
          city: 'Chittagong',
          country: 'Bangladesh',
          workArrangement: 'Hybrid',
        })
      );
    });
  });

  it('displays Closed banner when job status is Closed', async () => {
    const closedJob = { ...mockJob, status: 'Closed' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(closedJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          'This job is currently Closed. You can update its details and set a future deadline to reopen it.'
        )
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByText(
        "This job has Expired. Update the application deadline below to re-publish it, or click 'Save Changes' to update details while keeping it offline."
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "This job is currently Expired. Click 'Save & Re-publish' to make it active, or 'Save Changes' to keep it offline as Expired."
      )
    ).not.toBeInTheDocument();
  });

  it('displays Expired banner when job is Expired', async () => {
    const expiredJob = { ...mockJob, status: 'Expired', expireAt: '2020-01-01' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(expiredJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          "This job has Expired. Update the application deadline below to re-publish it, or click 'Save Changes' to update details while keeping it offline."
        )
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByText(
        'This job is currently Closed. You can update its details and set a future deadline to reopen it.'
      )
    ).not.toBeInTheDocument();
  });

  it('displays Expired banner when published job has past deadline', async () => {
    const pastDeadlineJob = {
      ...mockJob,
      status: 'Published',
      expireAt: '2020-01-01',
    };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(pastDeadlineJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          "This job has Expired. Update the application deadline below to re-publish it, or click 'Save Changes' to update details while keeping it offline."
        )
      ).toBeInTheDocument();
    });
  });

  it('displays Expired banner with republish instructions when expired job has future deadline', async () => {
    const expiredJobWithFutureDeadline = {
      ...mockJob,
      status: 'Expired',
      expireAt: '2026-12-31',
    };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(expiredJobWithFutureDeadline);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          "This job is currently Expired. Click 'Save & Re-publish' to make it active, or 'Save Changes' to keep it offline as Expired."
        )
      ).toBeInTheDocument();
    });
  });

  it('displays Save as Draft and Publish Job buttons for Draft job', async () => {
    const draftJob = { ...mockJob, status: 'Draft' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(draftJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save as Draft/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Publish Job/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Close Job/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Save & Reopen/i })).not.toBeInTheDocument();
  });

  it('displays Close Job and Save Changes buttons for Published job', async () => {
    const publishedJob = { ...mockJob, status: 'Published', expireAt: '2026-12-31' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(publishedJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Close Job/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Save as Draft/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Publish Job/i })).not.toBeInTheDocument();
  });

  it('displays Save Changes and Save & Reopen buttons for Closed job when deadline is in the future', async () => {
    const closedJob = { ...mockJob, status: 'Closed', expireAt: '2026-12-31' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(closedJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Save & Reopen/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Close Job/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Publish Job/i })).not.toBeInTheDocument();
  });

  it('hides Save & Reopen button for Closed job when deadline is in the past', async () => {
    const closedJobPastDeadline = { ...mockJob, status: 'Closed', expireAt: '2020-01-01' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(closedJobPastDeadline);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Save & Reopen/i })).not.toBeInTheDocument();
  });

  it('calls updateJob and reopenJob and redirects when Save & Reopen is clicked for Closed job', async () => {
    const closedJob = { ...mockJob, status: 'Closed', expireAt: '2026-12-31' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(closedJob);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});
    (employerJobsService.reopenJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save & Reopen/i })).toBeInTheDocument();
    });

    const reopenButton = screen.getByRole('button', { name: /Save & Reopen/i });
    await userEvent.click(reopenButton);

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({ publish: false })
      );
      expect(employerJobsService.reopenJob).toHaveBeenCalledWith(mockJobId);
      expect(mockPush).toHaveBeenCalledWith('/job/job-listing');
    });
  });

  it('displays Save Changes and Save & Re-publish buttons for Expired job when deadline is in the future', async () => {
    const expiredJob = { ...mockJob, status: 'Expired', expireAt: '2026-12-31' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(expiredJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Save & Re-publish/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Close Job/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Save as Draft/i })).not.toBeInTheDocument();
  });

  it('hides Save & Re-publish button for Expired job when deadline is in the past', async () => {
    const expiredJobPastDeadline = { ...mockJob, status: 'Expired', expireAt: '2020-01-01' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(expiredJobPastDeadline);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Save & Re-publish/i })).not.toBeInTheDocument();
  });

  it('calls updateJob with publish false when Save Changes is clicked for Expired job with past deadline', async () => {
    const expiredJobPastDeadline = { ...mockJob, status: 'Expired', expireAt: '2020-01-01' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(expiredJobPastDeadline);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const saveChangesButton = screen.getByRole('button', { name: /Save Changes/i });
    await userEvent.click(saveChangesButton);

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({ publish: false })
      );
    });
  });

  it('calls updateJob with publish true when Save & Re-publish is clicked for Expired job', async () => {
    const expiredJob = { ...mockJob, status: 'Expired', expireAt: '2026-12-31' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(expiredJob);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save & Re-publish/i })).toBeInTheDocument();
    });

    const republishButton = screen.getByRole('button', { name: /Save & Re-publish/i });
    await userEvent.click(republishButton);

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({ publish: true })
      );
      expect(mockPush).toHaveBeenCalledWith('/job/job-listing');
    });
  });

  it('triggers confirmation dialog when Close Job is clicked, and calls closeJob on confirmation', async () => {
    const publishedJob = { ...mockJob, status: 'Published', expireAt: '2026-12-31' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(publishedJob);
    (employerJobsService.closeJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Close Job/i })).toBeInTheDocument();
    });

    const closeJobButton = screen.getByRole('button', { name: /Close Job/i });
    await userEvent.click(closeJobButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Close Job' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /Closing "Senior Software Engineer" will remove it from public listings. Are you sure\?/i
      )
    ).toBeInTheDocument();

    const dialogElement = screen.getByRole('dialog');
    const dialogConfirmButton = within(dialogElement).getByRole('button', {
      name: 'Close Job',
    });
    await userEvent.click(dialogConfirmButton);

    await waitFor(() => {
      expect(employerJobsService.closeJob).toHaveBeenCalledWith(mockJobId);
    });
  });

  describe('focusFirstErrorField', () => {
    it('returns null when validationErrors is empty', () => {
      const resultMessage = focusFirstErrorField({});
      expect(resultMessage).toBeNull();
    });

    it('finds the first error in DOM order, scrolls to it, focuses it, and returns the error message', () => {
      const containerElement = document.createElement('div');
      const titleInputElement = document.createElement('input');
      titleInputElement.id = 'edit-job-title';
      titleInputElement.scrollIntoView = jest.fn();
      titleInputElement.focus = jest.fn();

      const descriptionTextAreaElement = document.createElement('textarea');
      descriptionTextAreaElement.id = 'edit-job-description';
      descriptionTextAreaElement.scrollIntoView = jest.fn();
      descriptionTextAreaElement.focus = jest.fn();

      containerElement.appendChild(titleInputElement);
      containerElement.appendChild(descriptionTextAreaElement);
      document.body.appendChild(containerElement);

      try {
        const firstErrorMessage = focusFirstErrorField({
          description: 'Job description must be at least 20 characters.',
          title: 'Job title is required.',
        });

        expect(firstErrorMessage).toBe('Job title is required.');
        expect(titleInputElement.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'center',
        });
        expect(titleInputElement.focus).toHaveBeenCalledWith({ preventScroll: true });
        expect(descriptionTextAreaElement.scrollIntoView).not.toHaveBeenCalled();
        expect(descriptionTextAreaElement.focus).not.toHaveBeenCalled();
      } finally {
        document.body.removeChild(containerElement);
      }
    });

    it('respects visual form order for all fields when multiple errors are present', () => {
      const containerElement = document.createElement('div');
      const vacanciesInputElement = document.createElement('input');
      vacanciesInputElement.id = 'edit-vacancies';
      vacanciesInputElement.scrollIntoView = jest.fn();
      vacanciesInputElement.focus = jest.fn();

      const expireAtInputElement = document.createElement('input');
      expireAtInputElement.id = 'edit-expire-at';
      expireAtInputElement.scrollIntoView = jest.fn();
      expireAtInputElement.focus = jest.fn();

      containerElement.appendChild(vacanciesInputElement);
      containerElement.appendChild(expireAtInputElement);
      document.body.appendChild(containerElement);

      try {
        const firstErrorMessage = focusFirstErrorField({
          expireAt: 'Application deadline is required to publish.',
          vacancies: 'Vacancies must be at least 1.',
        });

        expect(firstErrorMessage).toBe('Vacancies must be at least 1.');
        expect(vacanciesInputElement.scrollIntoView).toHaveBeenCalledWith({
          behavior: 'smooth',
          block: 'center',
        });
        expect(vacanciesInputElement.focus).toHaveBeenCalledWith({ preventScroll: true });
        expect(expireAtInputElement.scrollIntoView).not.toHaveBeenCalled();
      } finally {
        document.body.removeChild(containerElement);
      }
    });

    it('handles cases where the target DOM element is not found without throwing errors', () => {
      const firstErrorMessage = focusFirstErrorField({
        country: 'Country is required for Hybrid and On-Site roles (minimum 2 characters).',
      });

      expect(firstErrorMessage).toBe(
        'Country is required for Hybrid and On-Site roles (minimum 2 characters).'
      );
    });
  });

  it('shows specific error toast when Save Changes is clicked on published job with invalid company name', async () => {
    const publishedJob = { ...mockJob, status: 'Published' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(publishedJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    const companyNameInput = screen.getByDisplayValue('TechCorp');
    await userEvent.clear(companyNameInput);

    await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(toast.error).toHaveBeenCalledWith('Company name is required.');
    expect(screen.getByText('Company name is required.')).toBeInTheDocument();
    expect(employerJobsService.updateJob).not.toHaveBeenCalled();
  });

  it('shows specific error toast when Publish Job is clicked with missing description', async () => {
    const draftJobWithoutDescription = { ...mockJob, status: 'Draft', description: '' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(draftJobWithoutDescription);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publish Job/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Publish Job/i }));

    expect(toast.error).toHaveBeenCalledWith('Job description is required to publish.');
    expect(screen.getByText('Job description is required to publish.')).toBeInTheDocument();
    expect(employerJobsService.updateJob).not.toHaveBeenCalled();
  });

  it('shows specific error toast when Publish Job is clicked with missing requirements', async () => {
    const draftJobWithoutRequirements = { ...mockJob, status: 'Draft', requirements: '' };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(draftJobWithoutRequirements);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publish Job/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Publish Job/i }));

    expect(toast.error).toHaveBeenCalledWith('Requirements is required.');
    expect(screen.getByText('Requirements is required.')).toBeInTheDocument();
    expect(employerJobsService.updateJob).not.toHaveBeenCalled();
  });

  it('shows specific error toast when Publish Job is clicked with no skills', async () => {
    const draftJobWithoutSkills = { ...mockJob, status: 'Draft', requiredSkills: [] };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(draftJobWithoutSkills);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publish Job/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Publish Job/i }));

    expect(toast.error).toHaveBeenCalledWith('Required skills must have at least one skill.');
    expect(screen.getByText('Required skills must have at least one skill.')).toBeInTheDocument();
    expect(employerJobsService.updateJob).not.toHaveBeenCalled();
  });

  it('renders Compensation section with Negotiable selected when job has no salary', async () => {
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    expect(screen.getByText('Compensation')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Salary Type/)).toHaveValue('Negotiable');
    expect(screen.queryByLabelText(/^Currency/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Min Amount/)).not.toBeInTheDocument();
  });

  it('pre-fills salary fields from job data when salary is a range', async () => {
    const rangedSalaryJob = {
      ...mockJob,
      salaryType: 'Range',
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'BDT',
      salaryPeriod: 'PerMonth',
    };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(rangedSalaryJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Senior Software Engineer')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/^Salary Type/)).toHaveValue('Range');
    expect(screen.getByLabelText(/^Currency/)).toHaveValue('BDT');
    expect(screen.getByLabelText(/^Period/)).toHaveValue('PerMonth');
    expect(screen.getByLabelText(/^Min Amount/)).toHaveDisplayValue('80000');
    expect(screen.getByLabelText(/^Max Amount/)).toHaveDisplayValue('120000');
  });

  it('clears currency, period, and amounts when salary type is switched to Negotiable', async () => {
    const rangedSalaryJob = {
      ...mockJob,
      salaryType: 'Range',
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'BDT',
      salaryPeriod: 'PerMonth',
    };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(rangedSalaryJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/^Currency/)).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText(/^Salary Type/), 'Negotiable');

    expect(screen.queryByLabelText(/^Currency/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Period/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Min Amount/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Max Amount/)).not.toBeInTheDocument();
  });

  it('blocks publish and shows salary errors when range salary details are missing', async () => {
    const salaryLessRangeJob = {
      ...mockJob,
      status: 'Draft',
      salaryType: 'Range',
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      salaryPeriod: null,
    };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(salaryLessRangeJob);

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Publish Job/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Publish Job/i }));

    await waitFor(() => {
      expect(screen.getByText('Salary currency is required.')).toBeInTheDocument();
    });
    expect(screen.getByText('Salary period is required.')).toBeInTheDocument();
    expect(screen.getByText('Salary amount is required.')).toBeInTheDocument();
    expect(screen.getByText('Maximum salary is required.')).toBeInTheDocument();
    expect(employerJobsService.updateJob).not.toHaveBeenCalled();
  });

  it('sends salary fields in updateJob payload when saving a fixed salary', async () => {
    const fixedSalaryJob = {
      ...mockJob,
      status: 'Draft',
      salaryType: 'Fixed',
      salaryMin: 90000,
      salaryMax: 90000,
      salaryCurrency: 'BDT',
      salaryPeriod: 'PerMonth',
    };
    (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(fixedSalaryJob);
    (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});

    const Wrapper = createQueryWrapper();
    render(<EmployerEditJobView />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save as Draft/i })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save as Draft/i }));

    await waitFor(() => {
      expect(employerJobsService.updateJob).toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({
          salaryType: 'Fixed',
          salaryMin: 90000,
          salaryMax: 90000,
          salaryCurrency: 'BDT',
          salaryPeriod: 'PerMonth',
          publish: false,
        })
      );
    });
  });

  describe('moderated jobs', () => {
    const deactivatedJob = {
      ...mockJob,
      status: 'Deactivated',
      expireAt: '2026-12-31',
      deactivationReasonLabel: 'Misleading or invalid information',
      deactivationDetails: "The salary in the title doesn't match the posting.",
      deactivatedAt: '2026-09-10T08:00:00Z',
    };

    it('shows the reason and offers Save Changes and Save & Resubmit, but nothing that publishes', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(deactivatedJob);

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save & Resubmit/i })).toBeInTheDocument();
      });

      const banner = screen.getByRole('status');
      expect(banner).toHaveTextContent('An admin deactivated this job');
      expect(banner).toHaveTextContent('Misleading or invalid information');
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();

      for (const label of [
        /Publish Job/i,
        /Save as Draft/i,
        /Close Job/i,
        /Save & Re-publish/i,
        /Save & Reopen/i,
      ]) {
        expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
      }
    });

    it('saves with publish: false and then resubmits, never publishing directly', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(deactivatedJob);
      (employerJobsService.updateJob as jest.Mock).mockResolvedValue({});
      (employerJobsService.resubmitJob as jest.Mock).mockResolvedValue({});

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save & Resubmit/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save & Resubmit/i }));

      await waitFor(() => {
        expect(employerJobsService.updateJob).toHaveBeenCalledWith(
          mockJobId,
          expect.objectContaining({ publish: false })
        );
        expect(employerJobsService.resubmitJob).toHaveBeenCalledWith(mockJobId);
        expect(mockPush).toHaveBeenCalledWith('/job/job-listing');
      });

      // The backend rejects publish: true on a deactivated job, so it must never be sent.
      expect(employerJobsService.updateJob).not.toHaveBeenCalledWith(
        mockJobId,
        expect.objectContaining({ publish: true })
      );
    });

    it('blocks an incomplete job in the browser instead of letting the request fail', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...deactivatedJob,
        requirements: '',
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save & Resubmit/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save & Resubmit/i }));

      await waitFor(() => expect(toast.error).toHaveBeenCalled());
      expect(employerJobsService.updateJob).not.toHaveBeenCalled();
      expect(employerJobsService.resubmitJob).not.toHaveBeenCalled();
    });

    it('keeps the moderation actions when a deactivated job is also past its deadline', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...deactivatedJob,
        expireAt: '2020-01-01',
        isExpired: true,
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save & Resubmit/i })).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: /Save & Re-publish/i })).not.toBeInTheDocument();
    });

    it('locks the form entirely while an admin is reviewing the job', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...deactivatedJob,
        status: 'PendingReview',
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Under admin review');
      });

      // No form at all: the backend rejects every edit in this state.
      expect(screen.queryByDisplayValue('Senior Software Engineer')).not.toBeInTheDocument();
      expect(screen.queryByText('General Information')).not.toBeInTheDocument();
      for (const label of [/Save Changes/i, /Save & Resubmit/i, /Publish Job/i]) {
        expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
      }
      expect(screen.getByRole('button', { name: 'View job' })).toBeInTheDocument();
    });
  });

  describe('AI generation buttons', () => {
    beforeEach(() => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue(mockJob);
    });

    it('renders AI generation buttons for description, requirements, and skills', async () => {
      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Description/i })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /Generate Requirements/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Skills/i })).toBeInTheDocument();
    });

    it('shows toast error and focuses title input when generating AI content without a title', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...mockJob,
        title: '',
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Skills/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Skills/i }));

      expect(toast.error).toHaveBeenCalledWith('Please enter a job title first to generate content with AI.');
      expect(generateSkills).not.toHaveBeenCalled();
    });

    it('generates skills and appends only unique ones to existing skills', async () => {
      (generateSkills as jest.Mock).mockResolvedValue({
        skills: ['react', 'GraphQL', 'Docker', 'graphql', '  Docker  '], // 'react' is duplicate of 'React', 'graphql' and 'Docker' are intra-response duplicates
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Skills/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Skills/i }));

      await waitFor(() => {
        expect(generateSkills).toHaveBeenCalledWith({
          title: 'Senior Software Engineer',
          companyName: 'TechCorp',
          employmentType: 'FullTime',
          experienceLevel: 'SeniorLevel',
          workArrangement: 'Hybrid',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('GraphQL')).toBeInTheDocument();
        expect(screen.getByText('Docker')).toBeInTheDocument();
      });

      expect(toast.success).toHaveBeenCalledWith('Added 2 new skill(s) with AI.');
    });

    it('shows info toast when all generated skills already exist in list', async () => {
      (generateSkills as jest.Mock).mockResolvedValue({
        skills: ['React', 'TypeScript'],
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Skills/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Skills/i }));

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('All generated skills are already in the list.');
      });
    });

    it('handles skills generation API failure gracefully', async () => {
      (generateSkills as jest.Mock).mockRejectedValue(new Error('Generation failed'));

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Skills/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Skills/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to generate skills. Please try again.');
      });
    });

    it('opens confirm dialog when generating description with existing content and replaces on confirmation', async () => {
      (generateDescription as jest.Mock).mockResolvedValue({
        description: 'New AI generated comprehensive job description content.',
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Description/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Description/i }));

      // Confirm dialog should open
      await waitFor(() => {
        expect(screen.getByText('Overwrite Job Description?')).toBeInTheDocument();
      });
      expect(generateDescription).not.toHaveBeenCalled();

      // Click Confirm / Generate & Replace
      const confirmButton = screen.getByRole('button', { name: /Generate & Replace/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(generateDescription).toHaveBeenCalledWith({
          title: 'Senior Software Engineer',
          companyName: 'TechCorp',
          employmentType: 'FullTime',
          experienceLevel: 'SeniorLevel',
          workArrangement: 'Hybrid',
          requiredSkills: ['React', 'TypeScript', 'Node.js'],
        });
      });

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('New AI generated comprehensive job description content.')
        ).toBeInTheDocument();
      });
      expect(toast.success).toHaveBeenCalledWith('Job description generated successfully with AI.');
    });

    it('cancels description overwrite dialog without generating content', async () => {
      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Description/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Description/i }));

      await waitFor(() => {
        expect(screen.getByText('Overwrite Job Description?')).toBeInTheDocument();
      });

      const dialogElement = screen.getByRole('dialog');
      const cancelButton = within(dialogElement).getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Overwrite Job Description?')).not.toBeInTheDocument();
      });
      expect(generateDescription).not.toHaveBeenCalled();
    });

    it('generates description directly without dialog when description field is empty', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...mockJob,
        description: '',
      });
      (generateDescription as jest.Mock).mockResolvedValue({
        description: 'Directly generated description.',
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Description/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Description/i }));

      expect(screen.queryByText('Overwrite Job Description?')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(generateDescription).toHaveBeenCalled();
        expect(screen.getByDisplayValue('Directly generated description.')).toBeInTheDocument();
      });
      expect(toast.success).toHaveBeenCalledWith('Job description generated successfully with AI.');
    });

    it('handles description generation failure gracefully', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...mockJob,
        description: '',
      });
      (generateDescription as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Description/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Description/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to generate description. Please try again.');
      });
    });

    it('opens confirm dialog when generating requirements with existing content and replaces on confirmation', async () => {
      (generateRequirements as jest.Mock).mockResolvedValue({
        requirements: 'New AI generated requirements list.',
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Requirements/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Requirements/i }));

      // Confirm dialog should open
      await waitFor(() => {
        expect(screen.getByText('Overwrite Job Requirements?')).toBeInTheDocument();
      });
      expect(generateRequirements).not.toHaveBeenCalled();

      // Click Confirm / Generate & Replace
      const confirmButton = screen.getByRole('button', { name: /Generate & Replace/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(generateRequirements).toHaveBeenCalledWith({
          title: 'Senior Software Engineer',
          companyName: 'TechCorp',
          employmentType: 'FullTime',
          experienceLevel: 'SeniorLevel',
          workArrangement: 'Hybrid',
          requiredSkills: ['React', 'TypeScript', 'Node.js'],
        });
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('New AI generated requirements list.')).toBeInTheDocument();
      });
      expect(toast.success).toHaveBeenCalledWith('Job requirements generated successfully with AI.');
    });

    it('generates requirements directly without dialog when requirements field is empty', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...mockJob,
        requirements: '',
      });
      (generateRequirements as jest.Mock).mockResolvedValue({
        requirements: 'Directly generated requirements.',
      });

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Requirements/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Requirements/i }));

      expect(screen.queryByText('Overwrite Job Requirements?')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(generateRequirements).toHaveBeenCalled();
        expect(screen.getByDisplayValue('Directly generated requirements.')).toBeInTheDocument();
      });
      expect(toast.success).toHaveBeenCalledWith('Job requirements generated successfully with AI.');
    });

    it('handles requirements generation failure gracefully', async () => {
      (employerJobsService.getMyJobById as jest.Mock).mockResolvedValue({
        ...mockJob,
        requirements: '',
      });
      (generateRequirements as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<EmployerEditJobView />, { wrapper: createQueryWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Generate Requirements/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /Generate Requirements/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to generate requirements. Please try again.');
      });
    });
  });
});
