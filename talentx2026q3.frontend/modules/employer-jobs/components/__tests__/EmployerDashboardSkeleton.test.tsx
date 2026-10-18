import React from 'react';
import { render, screen } from '@testing-library/react';

import { EmployerDashboardSkeleton } from '../EmployerDashboardSkeleton';

describe('EmployerDashboardSkeleton', () => {
  it('renders skeleton container with aria-busy and data-testid', () => {
    render(<EmployerDashboardSkeleton className="custom-test-class" />);

    const skeletonMain = screen.getByTestId('employer-dashboard-skeleton');
    expect(skeletonMain).toBeInTheDocument();
    expect(skeletonMain).toHaveAttribute('aria-busy', 'true');

    const portalContainer = skeletonMain.closest('[class*="space-y-6"]');
    expect(portalContainer).toHaveClass('custom-test-class');
  });

  it('renders loading status message for screen readers', () => {
    render(<EmployerDashboardSkeleton />);

    const statusMessage = screen.getByRole('status', {
      name: /loading employer dashboard/i,
    });
    expect(statusMessage).toBeInTheDocument();
    expect(statusMessage).toHaveClass('sr-only');
  });

  it('renders 3 skeleton metric cards in horizontal grid', () => {
    const { container } = render(<EmployerDashboardSkeleton />);

    const metricCardsContainer = container.querySelector(
      '.grid.grid-cols-1.gap-4.sm\\:grid-cols-3'
    );
    expect(metricCardsContainer).toBeInTheDocument();
    expect(metricCardsContainer?.children).toHaveLength(3);
  });

  it('renders 2 skeleton quick action cards in grid', () => {
    const { container } = render(<EmployerDashboardSkeleton />);

    const quickActionsContainer = container.querySelector(
      '.grid.grid-cols-1.gap-4.sm\\:grid-cols-2'
    );
    expect(quickActionsContainer).toBeInTheDocument();
    expect(quickActionsContainer?.children).toHaveLength(2);
  });

  it('renders 2-column skeleton body with 2-column grid for charts and full-width recent activity', () => {
    const { container } = render(<EmployerDashboardSkeleton />);

    const bodyGrid = container.querySelector(
      '.grid.grid-cols-1.gap-6.lg\\:grid-cols-2'
    );
    expect(bodyGrid).toBeInTheDocument();
    expect(bodyGrid?.children).toHaveLength(2);

    const fullWidthRecentActivity = container.querySelector(
      '.flex.w-full.flex-col.rounded-md'
    );
    expect(fullWidthRecentActivity).toBeInTheDocument();
  });

  it('renders flat skeleton header without two-column split', () => {
    const { container } = render(<EmployerDashboardSkeleton />);

    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('space-y-2');
    expect(header).not.toHaveClass('lg:flex-row', 'rounded-2xl', 'bg-gradient-to-r');
  });
});
