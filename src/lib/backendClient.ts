

import getMyToken from '@/src/utilities/getMyToken';
import refreshAccessToken from '@/src/utilities/getRefreshToken';

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
 * - On 401 TOKEN_EXPIRED: automatically calls POST /auth/refresh (forwarding the
 *   HttpOnly refreshToken cookie), then retries the original request once with the
 *   new access token. Transparent to all callers — no change needed at call sites.
 * - If the refresh itself fails (expired/revoked/reuse detected), throws the original
 *   TOKEN_EXPIRED error so the app can redirect the user to login.
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

  const body: BackendEnvelope<T> = await res.json();

  // ── Token Refresh Intercept ───────────────────────────────────────────────
  // When the backend returns 401 TOKEN_EXPIRED on an authenticated request,
  // silently refresh the access token and retry the original request once.
  if (
    !skipAuth &&
    res.status === 401 &&
    'success' in body &&
    body.success === false &&
    body.error?.code === 'TOKEN_EXPIRED'
  ) {
    // refreshAccessToken() calls POST /auth/refresh.
    // Next.js forwards the HttpOnly refreshToken cookie automatically.
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry the original request with the fresh access token.
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryRes = await fetch(`${BACKEND_URL}/api/v1${path}`, {
        ...options,
        credentials: 'include',
        headers,
      });
      const retryBody: BackendEnvelope<T> = await retryRes.json();

      if ('success' in retryBody && retryBody.success === false) {
        throw new ApiError(
          retryBody.error.code,
          retryBody.error.message,
          retryRes.status,
          retryBody.error.details,
        );
      }

      const successRetry = retryBody as BackendSuccessEnvelope<T>;
      return { data: successRetry.data, pagination: successRetry.pagination };
    }

    // Refresh failed (refresh token expired / revoked / reuse detected).
    // Throw TOKEN_EXPIRED so the app can redirect the user to the login page.
    throw new ApiError(
      body.error.code,
      body.error.message,
      res.status,
      body.error.details,
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

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
