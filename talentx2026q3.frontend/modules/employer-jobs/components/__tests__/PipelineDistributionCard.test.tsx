import React from 'react';
import { render, screen } from '@testing-library/react';

import { PipelineDistributionCard } from '../PipelineDistributionCard';

describe('PipelineDistributionCard', () => {
  const defaultProps = {
    totalPostedJobs: 10,
    activeJobsCount: 5,
    draftJobsCount: 2,
    closedJobsCount: 2,
    expiredJobsCount: 1,
  };

  it('renders card header with title and formatted subtitle', () => {
    render(<PipelineDistributionCard {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Job Status Overview' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Breakdown of jobs by current status')
    ).toBeInTheDocument();
  });

  it('renders region container with accessible aria-labelledby and rounded-md class', () => {
    render(<PipelineDistributionCard {...defaultProps} className="custom-class" />);

    const region = screen.getByRole('region', { name: 'Job Status Overview' });
    expect(region).toBeInTheDocument();
    expect(region).toHaveClass('rounded-md', 'custom-class');
  });

  it('renders center text with total posted jobs and Jobs label', () => {
    render(<PipelineDistributionCard {...defaultProps} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
  });

  it('renders Recharts donut chart with segments for counts > 0', () => {
    const { container } = render(<PipelineDistributionCard {...defaultProps} />);

    const chartContainer = container.querySelector('[role="img"]');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveAttribute(
      'aria-label',
      'Job status overview chart showing 10 total jobs'
    );

    const sectors = container.querySelectorAll('.recharts-pie-sector');
    // 4 segment slices (active, draft, closed, expired)
    expect(sectors).toHaveLength(4);
  });

  it('renders all legend items with counts and percentage shares', () => {
    render(<PipelineDistributionCard {...defaultProps} />);

    expect(screen.getByText('Live roles')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('(50%)')).toBeInTheDocument();

    expect(screen.getByText('In preparation')).toBeInTheDocument();
    expect(screen.getAllByText('2')).toHaveLength(2);
    expect(screen.getAllByText('(20%)')).toHaveLength(2);

    expect(screen.getByText('Archived')).toBeInTheDocument();

    expect(screen.getByText('Past deadline')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('(10%)')).toBeInTheDocument();
  });

  it('renders past deadline alert banner with plural copy and review link when expiredJobsCount > 1', () => {
    render(
      <PipelineDistributionCard
        {...defaultProps}
        expiredJobsCount={3}
      />
    );

    expect(screen.getByText('3 listings are past deadline')).toBeInTheDocument();
    const reviewLink = screen.getByRole('link', { name: /review/i });
    expect(reviewLink).toBeInTheDocument();
    expect(reviewLink).toHaveAttribute('href', '/job/job-listing?status=Expired');
  });

  it('renders past deadline alert banner with singular copy when expiredJobsCount is 1', () => {
    render(
      <PipelineDistributionCard
        {...defaultProps}
        expiredJobsCount={1}
      />
    );

    expect(screen.getByText('1 listing is past deadline')).toBeInTheDocument();
  });

  it('omits past deadline from legend and omits alert banner when expiredJobsCount is 0', () => {
    render(
      <PipelineDistributionCard
        {...defaultProps}
        expiredJobsCount={0}
      />
    );

    expect(screen.queryByText('Past deadline')).not.toBeInTheDocument();
    expect(screen.queryByText(/past deadline/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /review/i })).not.toBeInTheDocument();
  });

  it('renders empty chart ring and 0 jobs when totalPostedJobs is 0', () => {
    const { container } = render(
      <PipelineDistributionCard
        totalPostedJobs={0}
        activeJobsCount={0}
        draftJobsCount={0}
        closedJobsCount={0}
        expiredJobsCount={0}
      />
    );

    expect(screen.getByText('Breakdown of jobs by current status')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(4);
    expect(screen.getByText('Jobs')).toBeInTheDocument();

    const chartContainer = container.querySelector('[role="img"]');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveAttribute(
      'aria-label',
      'Job status overview chart showing 0 total jobs'
    );

    const sectors = container.querySelectorAll('.recharts-pie-sector');
    expect(sectors).toHaveLength(1);

    // Legend items render with 0 and (0%)
    expect(screen.getByText('Live roles')).toBeInTheDocument();
    expect(screen.getByText('In preparation')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getAllByText('(0%)')).toHaveLength(3);
  });

  describe('moderated jobs', () => {
    it('leaves the card unchanged when nothing has been moderated', () => {
      render(
        <PipelineDistributionCard
          {...defaultProps}
          deactivatedJobsCount={0}
          pendingReviewJobsCount={0}
        />
      );

      expect(screen.queryByText('Deactivated by admin')).not.toBeInTheDocument();
      expect(screen.queryByText('Under review')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Fix/ })).not.toBeInTheDocument();
    });

    it('adds legend rows and chart slices for deactivated and under-review jobs', () => {
      const { container } = render(
        <PipelineDistributionCard
          totalPostedJobs={10}
          activeJobsCount={5}
          draftJobsCount={2}
          closedJobsCount={1}
          expiredJobsCount={0}
          deactivatedJobsCount={1}
          pendingReviewJobsCount={1}
        />
      );

      expect(screen.getByText('Deactivated by admin')).toBeInTheDocument();
      expect(screen.getByText('Under review')).toBeInTheDocument();
      // Past deadline stays hidden at 0, as before.
      expect(screen.queryByText('Past deadline')).not.toBeInTheDocument();

      // One slice per non-zero segment: active, draft, closed, deactivated, review.
      const sectors = container.querySelectorAll('.recharts-pie-sector');
      expect(sectors).toHaveLength(5);
    });

    it('links deactivated jobs straight to the filtered list so the employer can fix them', () => {
      render(
        <PipelineDistributionCard {...defaultProps} deactivatedJobsCount={1} />
      );

      expect(screen.getByText('1 listing was deactivated by an admin')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Fix/ })).toHaveAttribute(
        'href',
        '/job/job-listing?status=Deactivated'
      );
    });

    it('uses plural wording for more than one deactivated job', () => {
      render(
        <PipelineDistributionCard {...defaultProps} deactivatedJobsCount={2} />
      );

      expect(screen.getByText('2 listings were deactivated by an admin')).toBeInTheDocument();
    });
  });
});
