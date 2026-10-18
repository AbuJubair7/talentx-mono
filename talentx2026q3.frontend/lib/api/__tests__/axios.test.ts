import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { parseApiError, isAccountDeactivatedError } from '../axios';

function createMockAxiosError(
  status: number,
  responseData: unknown
): AxiosError {
  const mockHeaders = {} as AxiosResponse['headers'];
  const mockRequestConfig = {} as InternalAxiosRequestConfig;

  const mockResponse: AxiosResponse = {
    data: responseData,
    status,
    statusText: 'Error',
    headers: mockHeaders,
    config: mockRequestConfig,
  };

  const axiosError = new Error('Request failed') as AxiosError;
  axiosError.response = mockResponse;
  axiosError.config = mockRequestConfig;
  axiosError.isAxiosError = true;
  return axiosError;
}

describe('parseApiError', () => {
  it('extracts userResponse and devResponse when present', () => {
    const backendPayload = {
      userResponse: {
        message: 'You must be signed in to view employer dashboard.',
        resourceId: 'employer-123',
        errors: ['Authentication required.'],
      },
      devResponse: {
        message: 'You must be signed in to view employer dashboard.',
        details: 'TalentX.Application.Common.Exceptions.UnauthorizedException',
        exceptionType: 'UnauthorizedException',
        stackTrace: 'at GetEmployerDashboardQueryHandler.cs:line 32',
      },
    };

    const mockError = createMockAxiosError(401, backendPayload);
    const parsedApiError = parseApiError(mockError);

    expect(parsedApiError.status).toBe(401);
    expect(parsedApiError.message).toBe('You must be signed in to view employer dashboard.');
    expect(parsedApiError.resourceId).toBe('employer-123');
    expect(parsedApiError.errors).toEqual(['Authentication required.']);
    expect(parsedApiError.userResponse).toEqual(backendPayload.userResponse);
    expect(parsedApiError.devResponse).toEqual(backendPayload.devResponse);
  });

  it('handles network failure with no response', () => {
    const networkError = new Error('Network Error') as AxiosError;
    networkError.response = undefined;
    networkError.isAxiosError = true;

    const parsedApiError = parseApiError(networkError);

    expect(parsedApiError.status).toBeNull();
    expect(parsedApiError.message).toBe('Unable to reach the server. Please check your connection.');
    expect(parsedApiError.userResponse).toBeUndefined();
    expect(parsedApiError.devResponse).toBeUndefined();
  });

  it('does not blame connectivity for unexpected non-HTTP throws', () => {
    const unexpected = new TypeError('Cannot read properties of undefined');

    const parsedApiError = parseApiError(unexpected as unknown as AxiosError);

    expect(parsedApiError.status).toBeNull();
    expect(parsedApiError.message).toBe('Something went wrong. Please try again.');
    expect(parsedApiError.userResponse).toBeUndefined();
    expect(parsedApiError.devResponse).toBeUndefined();
  });

  it('falls back to legacy message when userResponse is absent', () => {
    const legacyPayload = {
      message: 'Legacy error format',
    };

    const mockError = createMockAxiosError(400, legacyPayload);
    const parsedApiError = parseApiError(mockError);

    expect(parsedApiError.status).toBe(400);
    expect(parsedApiError.message).toBe('Legacy error format');
    expect(parsedApiError.userResponse).toBeUndefined();
    expect(parsedApiError.devResponse).toBeUndefined();
  });
});

describe('isAccountDeactivatedError', () => {
  it('returns true when resourceId is ACCOUNT_DEACTIVATED', () => {
    const backendPayload = {
      userResponse: {
        message: 'Your account has been deactivated. Please contact TalentX support for more information.',
        resourceId: 'ACCOUNT_DEACTIVATED',
      },
    };

    const mockError = createMockAxiosError(403, backendPayload);
    const parsedApiError = parseApiError(mockError);

    expect(isAccountDeactivatedError(parsedApiError)).toBe(true);
  });

  it('returns false for an unrelated 403 (e.g. a different forbidden action)', () => {
    const backendPayload = {
      userResponse: {
        message: 'Admin accounts cannot be activated or deactivated here.',
        resourceId: undefined,
      },
    };

    const mockError = createMockAxiosError(403, backendPayload);
    const parsedApiError = parseApiError(mockError);

    expect(isAccountDeactivatedError(parsedApiError)).toBe(false);
  });

  it('returns false when there is no resourceId at all', () => {
    const parsedApiError = parseApiError(createMockAxiosError(400, { message: 'Bad input' }));

    expect(isAccountDeactivatedError(parsedApiError)).toBe(false);
  });
});

import { apiClient } from '../axios';
import { refreshSession } from '@/modules/auth/refresh/services/refresh.service';

jest.mock('@/modules/auth/refresh/services/refresh.service', () => ({
  refreshSession: jest.fn(),
}));

jest.mock('@/modules/auth/shared/auth-cookies.service', () => ({
  deleteAuthCookies: jest.fn(),
}));

describe('apiClient interceptors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deduplicates concurrent 401 refresh requests', async () => {
    let resolveRefresh!: (value: boolean) => void;
    const refreshPromise = new Promise<boolean>((resolve) => {
      resolveRefresh = resolve;
    });

    (refreshSession as jest.Mock).mockReturnValue(refreshPromise);
    const requestSpy = jest.spyOn(apiClient, 'request').mockResolvedValue('retried-response' as any);

    const error1 = createMockAxiosError(401, {});
    const error2 = createMockAxiosError(401, {});

    // Need to cast interceptors array to any to access handlers for testing
    const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

    const promise1 = interceptor(error1);
    const promise2 = interceptor(error2);

    expect(refreshSession).toHaveBeenCalledTimes(1);

    resolveRefresh(true);

    const [firstResponse, secondResponse] = await Promise.all([promise1, promise2]);

    expect(firstResponse).toBe('retried-response');
    expect(secondResponse).toBe('retried-response');
    expect(requestSpy).toHaveBeenCalledTimes(2);
  });

  function spyLocationHref() {
    const currentLocation = window.location;
    const implementationSymbol = Object.getOwnPropertySymbols(currentLocation).find(
      (symbol) => symbol.description === 'impl'
    );

    if (!implementationSymbol) {
      throw new Error('JSDOM Location implementation symbol not found');
    }

    const locationImplementation = (currentLocation as unknown as Record<symbol, unknown>)[
      implementationSymbol
    ] as {
      _locationObjectSetterNavigate: (action: { path: string[]; query: string | null }) => void;
    };

    const originalNavigate = locationImplementation._locationObjectSetterNavigate;
    let assignedHref = '';

    locationImplementation._locationObjectSetterNavigate = (action: {
      path: string[];
      query: string | null;
    }) => {
      assignedHref = '/' + action.path.join('/') + (action.query ? '?' + action.query : '');
    };

    return {
      getAssignedHref: () => assignedHref,
      restoreLocationSpy: () => {
        locationImplementation._locationObjectSetterNavigate = originalNavigate;
      },
    };
  }

  it('catches refreshSession rejection without crashing and redirects to /session-refresh with encoded target', async () => {
    window.history.pushState({}, '', '/portal/profile?tab=skills');
    const { getAssignedHref, restoreLocationSpy } = spyLocationHref();

    try {
      (refreshSession as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to find Server Action "abc123"')
      );

      const mockError = createMockAxiosError(401, {});
      const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

      await expect(interceptor(mockError)).rejects.toEqual(
        expect.objectContaining({
          status: 401,
          message: 'Your session has expired. Please log in again.',
        })
      );

      expect(getAssignedHref()).toBe(
        '/session-refresh?target=%2Fportal%2Fprofile%3Ftab%3Dskills'
      );
    } finally {
      restoreLocationSpy();
    }
  });

  it('redirects to /session-refresh when refreshSession resolves to false', async () => {
    window.history.pushState({}, '', '/jobs');
    const { getAssignedHref, restoreLocationSpy } = spyLocationHref();

    try {
      (refreshSession as jest.Mock).mockResolvedValueOnce(false);

      const mockError = createMockAxiosError(401, {});
      const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

      await expect(interceptor(mockError)).rejects.toEqual(
        expect.objectContaining({
          status: 401,
          message: 'Your session has expired. Please log in again.',
        })
      );

      expect(getAssignedHref()).toBe('/session-refresh?target=%2Fjobs');
    } finally {
      restoreLocationSpy();
    }
  });

  it('does not redirect to /session-refresh when current path is /login', async () => {
    window.history.pushState({}, '', '/login');
    const { getAssignedHref, restoreLocationSpy } = spyLocationHref();

    try {
      (refreshSession as jest.Mock).mockRejectedValueOnce(
        new Error('Network error during refresh')
      );

      const mockError = createMockAxiosError(401, {});
      const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

      await expect(interceptor(mockError)).rejects.toEqual(
        expect.objectContaining({
          status: 401,
        })
      );

      expect(getAssignedHref()).toBe('');
    } finally {
      restoreLocationSpy();
    }
  });

  it('does not redirect to /session-refresh when current path starts with /session-refresh', async () => {
    window.history.pushState({}, '', '/session-refresh?target=%2Fdashboard');
    const { getAssignedHref, restoreLocationSpy } = spyLocationHref();

    try {
      (refreshSession as jest.Mock).mockResolvedValueOnce(false);

      const mockError = createMockAxiosError(401, {});
      const interceptor = (apiClient.interceptors.response as any).handlers[0].rejected;

      await expect(interceptor(mockError)).rejects.toEqual(
        expect.objectContaining({
          status: 401,
        })
      );

      expect(getAssignedHref()).toBe('');
    } finally {
      restoreLocationSpy();
    }
  });
});
