import type { ApiError } from '@/lib/api/axios';

function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    'message' in error
  );
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    if (error.userResponse?.message) return error.userResponse.message;
    if (error.message) return error.message;
    if (error.errors?.length) return error.errors[0];
  }

  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
}
