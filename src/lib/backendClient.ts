'use server';

import getMyToken from '@/src/utilities/getMyToken';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5000';

/**
 * Typed error thrown when the backend returns { success: false, error: { code, message } }.
 * Consumers can check `err.code` for specific handling (e.g. ACCOUNT_LOCKED, MUST_CHANGE_PASSWORD).
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type BackendSuccessEnvelope<T> = {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type BackendErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type BackendEnvelope<T> = BackendSuccessEnvelope<T> | BackendErrorEnvelope;

/**
 * Central server-side fetch utility for all backend calls.
 *
 * - Automatically attaches the Bearer token from the NextAuth session.
 * - Forwards the `Cookie` header so the backend refreshToken HttpOnly cookie is sent.
 * - Unwraps the { success, data } envelope.
 * - Throws ApiError on { success: false } with the backend's error code and message.
 * - Returns both `data` and optional `pagination`.
 */
export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  skipAuth = false,
): Promise<{ data: T; pagination?: BackendSuccessEnvelope<T>['pagination'] }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!skipAuth) {
    try {
      const token = await getMyToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // If token retrieval fails, proceed without auth; the backend will return 401.
    }
  }

  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  // The health endpoint returns a plain object, not the standard envelope.
  // All other endpoints return the envelope.
  const body: BackendEnvelope<T> = await res.json();

  if ('success' in body && body.success === false) {
    throw new ApiError(
      body.error.code,
      body.error.message,
      res.status,
      body.error.details,
    );
  }

  const successBody = body as BackendSuccessEnvelope<T>;
  return { data: successBody.data, pagination: successBody.pagination };
}

/**
 * Converts an ApiError into a standardised Next.js Route Handler JSON response body.
 * Keeps the same { success, error } shape the backend uses, so client components
 * can parse errors uniformly regardless of which layer threw them.
 */
export function apiErrorResponse(err: unknown): {
  success: false;
  error: { code: string; message: string; details?: unknown };
} {
  if (err instanceof ApiError) {
    return {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    };
  }
  return {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
  };
}
