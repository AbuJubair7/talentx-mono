import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '../status-pill';
import type { ApplicationStatus } from '../../types';

describe('StatusPill Component', () => {
  const statuses: ApplicationStatus[] = [
    'Applied',
    'Interview',
    'Hired',
    'Rejected',
    'PendingVerification',
    'Invited',
  ];

  it.each(statuses)('renders status "%s" correctly without error', (status) => {
    const { container } = render(<StatusPill status={status} />);
    expect(container).toBeInTheDocument();
  });

  it('renders "Pending Verification" label for PendingVerification status', () => {
    render(<StatusPill status="PendingVerification" />);
    expect(screen.getByText('Pending Verification')).toBeInTheDocument();
  });

  it('renders "Applied" label for Applied status', () => {
    render(<StatusPill status="Applied" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('renders "Reviewed" with the default fallback style (no dedicated pill config)', () => {
    render(<StatusPill status="Reviewed" />);
    const pill = screen.getByText('Reviewed');
    expect(pill.className).toContain('text-slate-600');
    expect(pill.className).not.toContain('text-amber-600');
  });

  it('renders "Interview" label for Interview status', () => {
    render(<StatusPill status="Interview" />);
    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('renders "Hired" label for Hired status', () => {
    render(<StatusPill status="Hired" />);
    expect(screen.getByText('Hired')).toBeInTheDocument();
  });

  it('renders "Rejected" label for Rejected status', () => {
    render(<StatusPill status="Rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('defensively handles unknown status without throwing an exception', () => {
    // Suppress potential unhandled crash and verify graceful fallback rendering
    expect(() => {
      render(<StatusPill status={'UnknownStatus' as unknown as ApplicationStatus} />);
    }).not.toThrow();

    expect(screen.getByText('UnknownStatus')).toBeInTheDocument();
  });

  it('defensively handles empty/undefined status without throwing an exception', () => {
    expect(() => {
      render(<StatusPill status={'' as unknown as ApplicationStatus} />);
    }).not.toThrow();

    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('renders "Invited" label with the indigo style, not the default fallback', () => {
    render(<StatusPill status="Invited" />);
    const pill = screen.getByText('Invited');
    expect(pill.className).toContain('text-indigo-600');
    expect(pill.className).not.toContain('text-slate-600');
  });
});
