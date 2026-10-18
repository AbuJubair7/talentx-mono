// Server Actions / Server Components only — never import into a client component

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { cookies } from "next/headers"

import { API_URL } from "../config"
import { ACCESS_TOKEN_COOKIE } from "@/modules/auth/shared/cookie-config"

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

export function parseApiError(error: AxiosError<unknown>): ApiError {
  if (!error.response) {
    return {
      status: null,
      message: "Unable to reach the server. Please check your connection.",
    };
  }

  const status = error.response.status;
  const data = error.response.data as BackendErrorResponse | undefined;

  const message =
    data?.userResponse?.message ??
    data?.message ??
    data?.Message ??
    data?.detail ??
    data?.title ??
    "An unexpected error occurred.";

  const rawErrors = data?.userResponse?.errors ?? data?.errors ?? data?.Errors;
  let formattedErrors: string[] | undefined;

  if (Array.isArray(rawErrors)) {
    formattedErrors = rawErrors;
  } else if (rawErrors && typeof rawErrors === "object") {
    formattedErrors = Object.values(rawErrors).flat() as string[];
  }

  return {
    status,
    message,
    resourceId: data?.userResponse?.resourceId,
    errors: formattedErrors,
    userResponse: data?.userResponse,
    devResponse: data?.devResponse,
  };
}

const clientConfig = {
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
};

async function attachAccessToken(config: RetryableRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}

export const serverApiClient = axios.create(clientConfig);

serverApiClient.interceptors.request.use(attachAccessToken);

serverApiClient.interceptors.response.use(
  (response) => response,
  // NOTE: no auto-refresh here. The RSC cookie store is read-only, so calling
  // refreshSession() (cookies().set/delete) from a Server Component data fetch
  // throws "Cookies can only be modified in a Server Action or Route Handler".
  // Expired-session recovery is owned by the /session-refresh page (true Server
  // Action context); live client refetch recovery is owned by lib/api/axios.ts.
  // serverApiClient is therefore identical to serverApiClientNoRefresh.
  (error: AxiosError<BackendErrorResponse>) => Promise.reject(parseApiError(error))
);

export const serverApiClientNoRefresh = axios.create(clientConfig);

serverApiClientNoRefresh.interceptors.request.use(attachAccessToken);

serverApiClientNoRefresh.interceptors.response.use(
  (response) => response,
  (error: AxiosError<BackendErrorResponse>) => Promise.reject(parseApiError(error))
);