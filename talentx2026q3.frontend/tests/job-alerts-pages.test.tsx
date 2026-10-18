import React from 'react';
import { render, screen } from '@testing-library/react';
import JobAlertsPage, { metadata as jobAlertsMetadata } from '@/app/(portal)/job-alerts/page';
import { requireAuth } from '@/lib/auth/require-auth';
import { UserRole } from '@/types/auth';

jest.mock('@/lib/auth/require-auth', () => ({
  requireAuth: jest.fn(),
}));

jest.mock('@/modules/job-alerts', () => ({
  JobAlertsView: () => <div>Job Alerts View Component</div>,
}));

const mockedRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('Job Alerts Portal Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('JobAlertsPage', () => {
    it('defines correct metadata', () => {
      expect(jobAlertsMetadata.title).toBe('Job Alerts | TalentX');
    });

    it('requires Talent authentication and renders JobAlertsView', async () => {
      mockedRequireAuth.mockResolvedValueOnce({
        sub: 'talent-123',
        role: UserRole.Talent,
        email: 'candidate@example.com',
      });

      const pageElement = await JobAlertsPage();
      render(pageElement);

      expect(mockedRequireAuth).toHaveBeenCalledWith([UserRole.Talent]);
      expect(screen.getByText('Job Alerts View Component')).toBeInTheDocument();
    });
  });
});
