// Client components only

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

import { API_URL } from "../config"
import { refreshSession } from "@/modules/auth/refresh/services/refresh.service"
import { deleteAuthCookies } from "@/modules/auth/shared/auth-cookies.service"

let inFlightRefreshPromise: Promise<boolean> | null = null;

export interface UserResponse {
  message: string;
  resourceId?: string;
  errors?: string[];
}

export interface DevResponse {
  message: string;
  details?: string;
  exceptionType?: string;
  stackTrace?: string;
}

export interface ApiError {
  status: number | null;
  message: string;
  resourceId?: string;
  errors?: string[];
  userResponse?: UserResponse;
  devResponse?: DevResponse;
}

interface BackendErrorResponse {
  userResponse?: UserResponse;
  devResponse?: DevResponse;
  message?: string;
  Message?: string;
  errors?: string[] | Record<string, string[]>;
  Errors?: string[] | Record<string, string[]>;
  title?: string;
  detail?: string;
}

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function isApiError(e: unknown): e is ApiError {
  return (
    !!e &&
    typeof e === "object" &&
    "status" in e &&
    "message" in e &&
    !("response" in e) &&
    !axios.isAxiosError(e)
  );
}

export function parseApiError(error: unknown): ApiError {
  // Already parsed upstream (e.g. by an interceptor): pass it through untouched.
  if (isApiError(error)) return error;

  if (!axios.isAxiosError(error)) {
    // Unexpected non-HTTP throw (e.g. a client-side TypeError): never blame
    // connectivity and never leak raw internals to the user.
    return {
      status: null,
      message: "Something went wrong. Please try again.",
    };
  }

  if (!error.response) {
    return {
      status: null,
      message: "Unable to reach the server. Please check your connection.",
    };
  }

  const status = error.response.status;
  const raw = error.response.data;
  // Some backends/proxies return plain text or HTML instead of JSON.
  const data = (typeof raw === "object" && raw !== null ? raw : undefined) as
    | BackendErrorResponse
    | undefined;

  const rawErrors = data?.userResponse?.errors ?? data?.errors ?? data?.Errors;
  let formattedErrors: string[] | undefined;
  if (Array.isArray(rawErrors)) {
    formattedErrors = rawErrors;
  } else if (rawErrors && typeof rawErrors === "object") {
    formattedErrors = Object.values(rawErrors).flat() as string[];
  }

  const message =
    data?.userResponse?.message ??
    data?.message ??
    data?.Message ??
    data?.detail ??
    (typeof raw === "string" && raw.trim() ? raw : undefined) ??
    data?.title ??
    "An unexpected error occurred.";

  return {
    status,
    message,
    resourceId: data?.userResponse?.resourceId,
    errors: formattedErrors,
    userResponse: data?.userResponse,
    devResponse: data?.devResponse,
  };
}

// A deactivated account is signaled via a stable resourceId, not the status code alone (403 is
// also used for other, unrelated "forbidden" cases) — see the account-deactivation plan's Phase 4
// decisions for why this couldn't just be a 401.
export function isAccountDeactivatedError(apiError: ApiError): boolean {
  return apiError.resourceId === "ACCOUNT_DEACTIVATED";
}

// Helper to get absolute origin on server vs client
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client browser: relative URL works with Next.js rewrites  
    return "/api/backend";
  }
  // Server-side (SSR / Node): call backend API directly
  return API_URL;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendErrorResponse>) => {
    const apiError = parseApiError(error)

    // ------------------------------------------------
    // Account deactivated - force out immediately, skip the 401 retry dance below
    // ------------------------------------------------
    if (isAccountDeactivatedError(apiError)) {
      await deleteAuthCookies()
      if (typeof window !== "undefined") {
        // A full reload (not the Next.js router) is intentional here: it guarantees no stale
        // React Query cache or component state survives a forced logout.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login?reason=account-deactivated"
      }
      return Promise.reject(apiError)
    }

    const originalRequest = error.config as RetryableRequest | undefined

    // ------------------------------------------------
    // 401 - try refresh once, then retry original request
    // ------------------------------------------------
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      if (!inFlightRefreshPromise) {
        inFlightRefreshPromise = refreshSession().finally(() => {
          inFlightRefreshPromise = null
        })
      }

      let refreshed = false
      try {
        refreshed = await inFlightRefreshPromise
      } catch {
        refreshed = false
      }

      if (refreshed) {
        // New auth cookie is already set by the server;
        // the browser will attach it automatically on retry.
        return apiClient.request(originalRequest)
      }

      if (!refreshed) {
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login" &&
          !window.location.pathname.startsWith("/session-refresh")
        ) {
          const currentPath = window.location.pathname + window.location.search
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `/session-refresh?target=${encodeURIComponent(currentPath)}`
        }

        return Promise.reject({
          status: 401,
          message: "Your session has expired. Please log in again.",
        } as ApiError)
      }
    }

    // ------------------------------------------------
    // Network error / API error
    // ------------------------------------------------
    return Promise.reject(apiError)
  }
)