import React from 'react';
import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';

import ApplyPage from '@/app/(public)/jobs/[id]/apply/page';
import { getAuthCookies } from '@/modules/auth/shared/auth-cookies.service';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { UserRole } from '@/types/auth';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/modules/auth/shared/auth-cookies.service', () => ({
  getAuthCookies: jest.fn(),
}));

jest.mock('@/lib/auth/jwt', () => ({
  decodeAccessToken: jest.fn(),
}));

jest.mock('@/modules/job-listing', () => ({
  jobListingService: {
    getJobDetails: jest.fn().mockResolvedValue({
      title: 'Backend Engineer',
      companyName: 'Acme',
    }),
  },
}));

jest.mock('@/modules/job-application', () => ({
  GuestApplyView: () => <div data-testid="guest-apply-view" />,
}));

jest.mock('@/components/common/header', () => ({
  Header: () => <div data-testid="header" />,
}));

jest.mock('@/components/common/footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

const mockedGetAuthCookies = getAuthCookies as jest.MockedFunction<typeof getAuthCookies>;
const mockedDecodeAccessToken = decodeAccessToken as jest.MockedFunction<typeof decodeAccessToken>;
const mockedRedirect = redirect as jest.MockedFunction<typeof redirect>;

function renderApplyPage() {
  return ApplyPage({ params: Promise.resolve({ id: 'job-123' }) });
}

describe('ApplyPage token refresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bounces through the refresh-redirect route handler when the access token is expired but a refresh token exists', async () => {
    mockedGetAuthCookies.mockResolvedValue({
      accessToken: 'expired-token',
      refreshToken: 'valid-refresh-token',
    });
    // Expired access token → decodeAccessToken returns null
    mockedDecodeAccessToken.mockReturnValue(null);

    await renderApplyPage();

    // Cookies may only be written in a Server Action or Route Handler, so the
    // page must redirect instead of calling refreshSession() during render.
    expect(mockedRedirect).toHaveBeenCalledWith(
      '/api/auth/refresh-redirect?next=/jobs/job-123/apply'
    );
  });

  it('renders the guest apply view for a fully anonymous visitor', async () => {
    mockedGetAuthCookies.mockResolvedValue({
      accessToken: null,
      refreshToken: null,
    });

    // Async server component: await the page function, then render the element.
    const element = await renderApplyPage();
    const { container } = render(element as React.ReactElement);

    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(container.querySelector('[data-testid="guest-apply-view"]')).not.toBeNull();
  });

  it('redirects a logged-in Talent straight to the apply flow', async () => {
    mockedGetAuthCookies.mockResolvedValue({
      accessToken: 'valid-token',
      refreshToken: 'valid-refresh-token',
    });
    mockedDecodeAccessToken.mockReturnValue({
      sub: 'user-1',
      role: UserRole.Talent,
    });

    await renderApplyPage();

    expect(mockedRedirect).toHaveBeenCalledWith('/apply/job-123');
  });
});
