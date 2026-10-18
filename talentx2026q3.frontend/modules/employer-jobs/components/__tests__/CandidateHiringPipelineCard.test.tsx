import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { CandidateHiringPipelineCard } from '../CandidateHiringPipelineCard';

describe('CandidateHiringPipelineCard', () => {
  const defaultProps = {
    appliedCount: 10,
    shortlistedCount: 4,
    invitedCount: 3,
    interviewCount: 2,
    rejectedCount: 2,
    hiredCount: 1,
  };

  it('renders card header with title and formatted subtitle', () => {
    render(<CandidateHiringPipelineCard {...defaultProps} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Candidate Hiring Pipeline' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Applicant distribution across hiring stages')
    ).toBeInTheDocument();
  });

  it('renders region container with accessible aria-labelledby and rounded-md class', () => {
    render(
      <CandidateHiringPipelineCard {...defaultProps} className="custom-pipeline-class" />
    );

    const regionElement = screen.getByRole('region', {
      name: 'Candidate Hiring Pipeline',
    });
    expect(regionElement).toBeInTheDocument();
    expect(regionElement).toHaveClass('rounded-md', 'custom-pipeline-class');
  });

  it('renders center text with calculated total candidates and Candidates label', () => {
    render(<CandidateHiringPipelineCard {...defaultProps} />);

    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('Candidates')).toBeInTheDocument();
  });

  it('renders Recharts donut chart with segments for stages with counts > 0', () => {
    const { container } = render(<CandidateHiringPipelineCard {...defaultProps} />);

    const chartContainer = container.querySelector('[role="img"]');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveAttribute(
      'aria-label',
      'Candidate hiring pipeline chart showing 22 total candidates'
    );

    const sectors = container.querySelectorAll('.recharts-pie-sector');
    expect(sectors).toHaveLength(5);
  });

  it('renders all 5 evaluation stage legend items with accurate counts and percentage shares and excludes applied', () => {
    render(<CandidateHiringPipelineCard {...defaultProps} />);

    expect(screen.queryByText('Applied')).not.toBeInTheDocument();

    const shortlistedItem = screen.getByText('Shortlisted').closest('li');
    expect(shortlistedItem).toBeInTheDocument();
    if (shortlistedItem) {
      expect(within(shortlistedItem).getByText('4')).toBeInTheDocument();
      expect(within(shortlistedItem).getByText('(18%)')).toBeInTheDocument();
    }

    const invitedItem = screen.getByText('Invited').closest('li');
    expect(invitedItem).toBeInTheDocument();
    if (invitedItem) {
      expect(within(invitedItem).getByText('3')).toBeInTheDocument();
      expect(within(invitedItem).getByText('(14%)')).toBeInTheDocument();
    }

    const interviewItem = screen.getByText('Interview').closest('li');
    expect(interviewItem).toBeInTheDocument();
    if (interviewItem) {
      expect(within(interviewItem).getByText('2')).toBeInTheDocument();
      expect(within(interviewItem).getByText('(9%)')).toBeInTheDocument();
    }

    const hiredItem = screen.getByText('Hired').closest('li');
    expect(hiredItem).toBeInTheDocument();
    if (hiredItem) {
      expect(within(hiredItem).getByText('1')).toBeInTheDocument();
      expect(within(hiredItem).getByText('(5%)')).toBeInTheDocument();
    }

    const rejectedItem = screen.getByText('Rejected').closest('li');
    expect(rejectedItem).toBeInTheDocument();
    if (rejectedItem) {
      expect(within(rejectedItem).getByText('2')).toBeInTheDocument();
      expect(within(rejectedItem).getByText('(9%)')).toBeInTheDocument();
    }
  });

  it('renders empty chart ring, center 0 Candidates, and accessible banner when totalCandidates is 0', () => {
    const { container } = render(
      <CandidateHiringPipelineCard
        appliedCount={0}
        shortlistedCount={0}
        invitedCount={0}
        interviewCount={0}
        rejectedCount={0}
        hiredCount={0}
      />
    );

    expect(screen.getAllByText('0')).toHaveLength(6);
    expect(screen.getByText('Candidates')).toBeInTheDocument();

    const chartContainer = container.querySelector('[role="img"]');
    expect(chartContainer).toBeInTheDocument();
    expect(chartContainer).toHaveAttribute(
      'aria-label',
      'Candidate hiring pipeline chart showing 0 total candidates'
    );

    const sectors = container.querySelectorAll('.recharts-pie-sector');
    expect(sectors).toHaveLength(1);

    const emptyBanner = screen.getByRole('status');
    expect(emptyBanner).toBeInTheDocument();
    expect(emptyBanner).toHaveTextContent(
      'No applicants yet. As candidates apply or receive invitations, their progress across stages will appear here.'
    );

    expect(screen.getAllByText('(0%)')).toHaveLength(5);
  });

  it('renders correctly with default prop values when no counts are provided', () => {
    render(<CandidateHiringPipelineCard />);

    expect(screen.getAllByText('0')).toHaveLength(6);
    expect(screen.getByText('Candidates')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('supports interactive legend mouse enter and leave events', () => {
    render(<CandidateHiringPipelineCard {...defaultProps} />);

    const shortlistedLegendItem = screen.getByText('Shortlisted').closest('li');
    expect(shortlistedLegendItem).toBeInTheDocument();

    if (shortlistedLegendItem) {
      fireEvent.mouseEnter(shortlistedLegendItem);
      fireEvent.mouseLeave(shortlistedLegendItem);
    }
  });
});
