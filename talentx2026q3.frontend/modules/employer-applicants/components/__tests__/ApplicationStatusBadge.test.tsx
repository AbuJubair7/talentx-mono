import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApplicationStatusBadge } from '../ApplicationStatusBadge';

describe('ApplicationStatusBadge', () => {
  it('renders Applied badge correctly', () => {
    render(<ApplicationStatusBadge status="Applied" />);
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('renders Interview badge correctly', () => {
    render(<ApplicationStatusBadge status="Interview" />);
    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('renders Hired badge correctly', () => {
    render(<ApplicationStatusBadge status="Hired" />);
    expect(screen.getByText('Hired')).toBeInTheDocument();
  });

  it('renders Rejected badge correctly', () => {
    render(<ApplicationStatusBadge status="Rejected" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('renders Reviewed badge correctly', () => {
    render(<ApplicationStatusBadge status="Reviewed" />);
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
  });

  it('renders PendingVerification badge as Pending', () => {
    render(<ApplicationStatusBadge status="PendingVerification" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders Invited badge with the indigo style, not the default fallback', () => {
    render(<ApplicationStatusBadge status="Invited" />);
    const badge = screen.getByText('Invited');
    expect(badge.className).toContain('bg-indigo-50');
    expect(badge.className).not.toContain('bg-slate-100');
  });

  it('renders Shortlisted badge with the teal style, not the default fallback', () => {
    render(<ApplicationStatusBadge status="Shortlisted" />);
    const badge = screen.getByText('Shortlisted');
    expect(badge.className).toContain('bg-teal-50');
    expect(badge.className).not.toContain('bg-slate-100');
  });
});
