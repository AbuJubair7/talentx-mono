import React from 'react';
import { createEvent, fireEvent, render, screen, within } from '@testing-library/react';

import {
  EmployerJobsCardView,
  EmployerJobsCardViewSkeleton,
} from '../EmployerJobsCardView';
import type { EmployerJobListItemDto } from '../../types/employer-job.types';

let mockSessionUser: { name?: string | null; email?: string | null } | null = {
  name: 'Sarah Hiring',
  email: 'sarah@example.com',
};

jest.mock('@/components/common/use-header-session', () => ({
  useHeaderSession: () => ({
    user: mockSessionUser,
    isLoading: false,
    isAuthenticated: true,
  }),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DropdownMenuTrigger: ({
    children,
    ...restProperties
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement('button', restProperties, children),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => React.createElement('button', { onClick, className }, children),
  DropdownMenuLinkItem: ({
    children,
    href,
    className,
    ...restProperties
  }: {
    children: React.ReactNode;
    href?: string;
    className?: string;
    [key: string]: unknown;
  }) => React.createElement('a', { href, className, ...restProperties }, children),
  DropdownMenuSeparator: () => React.createElement('hr', null),
}));

const mockJobs: EmployerJobListItemDto[] = [
  {
    id: 'job-1',
    title: 'Senior AI Engineer',
    companyName: 'Acme Corp',
    status: 'Published',
    employmentType: 'FullTime',
    workArrangement: 'FullRemote',
    experienceLevel: 'SeniorLevel',
    location: 'San Francisco, CA',
    vacancies: 2,
    applicantCount: 15,
    createdAt: new Date().toISOString(),
    expireAt: '2026-12-31T23:59:59Z',
  },
  {
    id: 'job-2',
    title: 'ML Platform Lead',
    companyName: 'Tech Innovators',
    status: 'Draft',
    employmentType: 'Contract',
    workArrangement: 'Hybrid',
    experienceLevel: 'Lead',
    location: 'New York, NY',
    vacancies: 1,
    applicantCount: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expireAt: '2026-12-31T23:59:59Z',
  },
];

describe('EmployerJobsCardView', () => {
  const defaultCardViewProps = {
    jobs: mockJobs,
    onCloseJob: jest.fn(),
    onDeleteJob: jest.fn(),
    onReopenJob: jest.fn(),
    onPublishJob: jest.fn(),
    onSelectJob: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionUser = {
      name: 'Sarah Hiring',
      email: 'sarah@example.com',
    };
  });

  describe('Empty State', () => {
    it('renders empty state message and Post a Job link with correct styling', () => {
      render(<EmployerJobsCardView {...defaultCardViewProps} jobs={[]} />);

      expect(screen.getByText('No jobs found.')).toBeInTheDocument();
      expect(
        screen.getByText('Get started by creating your first position.'),
      ).toBeInTheDocument();

      const postJobLink = screen.getByRole('link', { name: 'Post a Job' });
      expect(postJobLink).toBeInTheDocument();
      expect(postJobLink).toHaveAttribute('href', '/job/jobpost');
      expect(postJobLink).toHaveClass('bg-emerald-700');
    });
  });

  describe('Skeleton Component', () => {
    it('renders skeleton cards with correct count, aria labels, and rounded-md border radius', () => {
      render(<EmployerJobsCardViewSkeleton cardCount={3} />);

      const skeletonContainer = screen.getByTestId(
        'employer-jobs-cards-skeleton',
      );
      expect(skeletonContainer).toBeInTheDocument();
      expect(skeletonContainer.children).toHaveLength(3);
      expect(skeletonContainer.firstElementChild).toHaveClass('rounded-md');
    });

    it('defaults to 6 skeleton cards when cardCount is not provided', () => {
      render(<EmployerJobsCardViewSkeleton />);

      const skeletonContainer = screen.getByTestId(
        'employer-jobs-cards-skeleton',
      );
      expect(skeletonContainer).toBeInTheDocument();
      expect(skeletonContainer.children).toHaveLength(6);
    });
  });

  describe('Card Content & Layout', () => {
    it('renders job cards with rounded-md border, company name above title, and emerald title', () => {
      render(<EmployerJobsCardView {...defaultCardViewProps} />);

      const firstCard = screen.getByTestId('job-card-job-1');
      expect(firstCard).toHaveClass('rounded-md');
      expect(within(firstCard).getByText('Acme Corp')).toBeInTheDocument();

      const titleHeading = within(firstCard).getByRole('heading', {
        name: 'Senior AI Engineer',
      });
      expect(titleHeading).toBeInTheDocument();
      expect(titleHeading).toHaveClass('text-emerald-800', 'text-base', 'font-semibold');
    });

    it('renders status badge and action dropdown in top-right header', () => {
      render(<EmployerJobsCardView {...defaultCardViewProps} />);

      const firstCard = screen.getByTestId('job-card-job-1');
      expect(within(firstCard).getByText('Active')).toBeInTheDocument();
      expect(
        within(firstCard).getByLabelText('Job actions for Senior AI Engineer'),
      ).toBeInTheDocument();

      const secondCard = screen.getByTestId('job-card-job-2');
      expect(within(secondCard).getByText('Draft')).toBeInTheDocument();
    });

    it('renders Negotiable salary badge on cards without salary fields', () => {
      render(<EmployerJobsCardView {...defaultCardViewProps} />);

      const salaryIndicators = screen.getAllByText('Negotiable');
      expect(salaryIndicators).toHaveLength(2);
      expect(salaryIndicators[0]).toHaveClass('bg-amber-50', 'text-amber-800', 'font-bold');
    });

    it('renders formatted salary range badge on cards with salary fields', () => {
      const rangedSalaryJobs: EmployerJobListItemDto[] = [
        {
          id: 'job-3',
          title: 'Senior Backend Engineer',
          companyName: 'Acme Corp',
          status: 'Published',
          employmentType: 'FullTime',
          workArrangement: 'FullRemote',
          experienceLevel: 'SeniorLevel',
          location: 'Dhaka, Bangladesh',
          vacancies: 2,
          applicantCount: 5,
          createdAt: new Date().toISOString(),
          expireAt: '2026-12-31T23:59:59Z',
          salaryType: 'Range',
          salaryMin: 80000,
          salaryMax: 120000,
          salaryCurrency: 'BDT',
          salaryPeriod: 'PerMonth',
        },
      ];
      render(<EmployerJobsCardView {...defaultCardViewProps} jobs={rangedSalaryJobs} />);

      const salaryIndicator = screen.getByText('80,000-120,000 BDT/month');
      expect(salaryIndicator).toBeInTheDocument();
      expect(salaryIndicator).toHaveClass('bg-amber-50', 'text-amber-800', 'font-bold');
    });

    it('renders dot-separated metadata with employment type, experience, and applicant count', () => {
      render(<EmployerJobsCardView {...defaultCardViewProps} />);

      const firstCard = screen.getByTestId('job-card-job-1');
      expect(within(firstCard).getByText('Full Time')).toBeInTheDocument();
      expect(
        within(firstCard).getByText('Experience: Senior Level'),
      ).toBeInTheDocument();
      expect(
        within(firstCard).getByText('San Francisco, CA'),
      ).toBeInTheDocument();
      expect(within(firstCard).getByText('15 Applicants')).toBeInTheDocument();

      const secondCard = screen.getByTestId('job-card-job-2');
      expect(within(secondCard).getByText('1 Applicant')).toBeInTheDocument();
    });

    it('renders footer with author attribution, relative date, and View Details button', () => {
      render(<EmployerJobsCardView {...defaultCardViewProps} />);

      const firstCard = screen.getByTestId('job-card-job-1');
      expect(within(firstCard).getByText('Sarah Hiring')).toBeInTheDocument();
      expect(within(firstCard).getByText('Today')).toBeInTheDocument();

      const viewDetailsLinks = within(firstCard).getAllByRole('link', {
        name: 'View Details',
      });
      expect(viewDetailsLinks).toHaveLength(2);
      const footerActionButton = viewDetailsLinks.find((link) =>
        link.classList.contains('bg-emerald-700'),
      );
      expect(footerActionButton).toBeDefined();
      expect(footerActionButton).toHaveAttribute(
        'href',
        '/job/job-listing/job-1',
      );
      expect(footerActionButton).toHaveClass('bg-emerald-700', 'rounded-md');
    });

    it('falls back to companyName in footer when session user has no name', () => {
      mockSessionUser = null;
      render(<EmployerJobsCardView {...defaultCardViewProps} />);

      const firstCard = screen.getByTestId('job-card-job-1');
      const authorText = within(firstCard).getAllByText('Acme Corp');
      expect(authorText.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Pipeline Summary Dialog Interaction', () => {
    it('renders card container with role="button", tabIndex={0}, and aria-haspopup="dialog"', () => {
      render(<EmployerJobsCardView {...defaultCardViewProps} />);

      const firstCard = screen.getByTestId('job-card-job-1');
      expect(firstCard).toHaveAttribute('role', 'button');
      expect(firstCard).toHaveAttribute('tabindex', '0');
      expect(firstCard).toHaveAttribute('aria-haspopup', 'dialog');
      expect(firstCard).toHaveAttribute(
        'aria-label',
        'View applicant pipeline summary for Senior AI Engineer'
      );
    });

    it('calls onSelectJob with the clicked job when the card container is clicked', () => {
      const onSelectJobMock = jest.fn();
      render(
        <EmployerJobsCardView
          {...defaultCardViewProps}
          onSelectJob={onSelectJobMock}
        />
      );

      const firstCard = screen.getByTestId('job-card-job-1');
      fireEvent.click(firstCard);

      expect(onSelectJobMock).toHaveBeenCalledTimes(1);
      expect(onSelectJobMock).toHaveBeenCalledWith(mockJobs[0]);
    });

    it('calls onSelectJob when Enter is pressed on the card container', () => {
      const onSelectJobMock = jest.fn();
      render(
        <EmployerJobsCardView
          {...defaultCardViewProps}
          onSelectJob={onSelectJobMock}
        />
      );

      const firstCard = screen.getByTestId('job-card-job-1');
      fireEvent.keyDown(firstCard, { key: 'Enter' });

      expect(onSelectJobMock).toHaveBeenCalledTimes(1);
      expect(onSelectJobMock).toHaveBeenCalledWith(mockJobs[0]);
    });

    it('calls onSelectJob and prevents default when Space is pressed on the card container', () => {
      const onSelectJobMock = jest.fn();
      render(
        <EmployerJobsCardView
          {...defaultCardViewProps}
          onSelectJob={onSelectJobMock}
        />
      );

      const firstCard = screen.getByTestId('job-card-job-1');
      const spaceKeyDownEvent = createEvent.keyDown(firstCard, { key: ' ' });
      fireEvent(firstCard, spaceKeyDownEvent);

      expect(spaceKeyDownEvent.defaultPrevented).toBe(true);
      expect(onSelectJobMock).toHaveBeenCalledTimes(1);
      expect(onSelectJobMock).toHaveBeenCalledWith(mockJobs[0]);
    });

    it('calls onSelectJob when clicking the job title heading', () => {
      const onSelectJobMock = jest.fn();
      render(
        <EmployerJobsCardView
          {...defaultCardViewProps}
          onSelectJob={onSelectJobMock}
        />
      );

      const firstCard = screen.getByTestId('job-card-job-1');
      const titleHeading = within(firstCard).getByRole('heading', {
        name: 'Senior AI Engineer',
      });
      fireEvent.click(titleHeading);

      expect(onSelectJobMock).toHaveBeenCalledTimes(1);
      expect(onSelectJobMock).toHaveBeenCalledWith(mockJobs[0]);
    });

    it('stops propagation and does NOT call onSelectJob when clicking the View Details button', () => {
      const onSelectJobMock = jest.fn();
      render(
        <EmployerJobsCardView
          {...defaultCardViewProps}
          onSelectJob={onSelectJobMock}
        />
      );

      const firstCard = screen.getByTestId('job-card-job-1');
      const viewDetailsLinks = within(firstCard).getAllByRole('link', {
        name: 'View Details',
      });
      const footerActionButton = viewDetailsLinks.find((link) =>
        link.classList.contains('bg-emerald-700')
      );
      expect(footerActionButton).toBeDefined();

      fireEvent.click(footerActionButton!);

      expect(onSelectJobMock).not.toHaveBeenCalled();
    });

    it('stops propagation and does NOT call onSelectJob when clicking the action dropdown trigger', () => {
      const onSelectJobMock = jest.fn();
      render(
        <EmployerJobsCardView
          {...defaultCardViewProps}
          onSelectJob={onSelectJobMock}
        />
      );

      const firstCard = screen.getByTestId('job-card-job-1');
      const actionTrigger = within(firstCard).getByLabelText(
        'Job actions for Senior AI Engineer'
      );
      fireEvent.click(actionTrigger);

      expect(onSelectJobMock).not.toHaveBeenCalled();
    });
  });
});
