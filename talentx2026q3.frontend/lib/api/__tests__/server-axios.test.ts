import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { serverApiClient } from '../server-axios';
import { refreshSession } from '@/modules/auth/refresh/services/refresh.service';

// Asserts the no-refresh contract: expired-session recovery is owned by the
// /session-refresh page (Server Action context) and lib/api/axios.ts (client),
// never by this server-side client — the RSC cookie store is read-only, so an
// interceptor-side refreshSession() would rotate-then-lose the refresh token.
jest.mock('@/modules/auth/refresh/services/refresh.service', () => ({
  refreshSession: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: () => undefined,
  }),
}));

function createMockAxiosError(status: number, data: unknown = {}): AxiosError {
  const mockResponse: AxiosResponse = {
    data,
    status,
    statusText: 'Error',
    headers: {} as AxiosResponse['headers'],
    config: {} as InternalAxiosRequestConfig,
  };

  const axiosError = new Error('Request failed') as AxiosError;
  axiosError.response = mockResponse;
  axiosError.config = { headers: {} as InternalAxiosRequestConfig['headers'] } as InternalAxiosRequestConfig;
  axiosError.isAxiosError = true;
  return axiosError;
}

describe('serverApiClient response interceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function getRejectedInterceptor(): (error: AxiosError) => Promise<unknown> {
    return (serverApiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<unknown> }>;
    }).handlers[0].rejected;
  }

  async function rejectionOf(error: AxiosError): Promise<unknown> {
    return getRejectedInterceptor()(error).then(
      () => 'unexpected-success',
      (reason: unknown) => reason
    );
  }

  it('rejects a 401 with the backend message without refreshing or retrying', async () => {
    const requestSpy = jest.spyOn(serverApiClient, 'request');

    const rejection = await rejectionOf(createMockAxiosError(401, { message: 'Token has expired' }));

    expect(rejection).toEqual({ status: 401, message: 'Token has expired' });
    expect(refreshSession).not.toHaveBeenCalled();
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('rejects a 401 with the fallback message when the backend sends none', async () => {
    const rejection = await rejectionOf(createMockAxiosError(401));

    expect(rejection).toEqual({
      status: 401,
      message: 'An unexpected error occurred.',
    });
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('rejects non-401 errors through parseApiError without attempting a refresh', async () => {
    const rejection = await rejectionOf(createMockAxiosError(500, { message: 'Backend exploded' }));

    expect(rejection).toEqual({ status: 500, message: 'Backend exploded' });
    expect(refreshSession).not.toHaveBeenCalled();
  });
});
