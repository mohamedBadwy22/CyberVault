import getMyToken from "@/src/utilities/getMyToken";
import refreshAccessToken from "@/src/utilities/getRefreshToken";

// Backend spec §4: BACKEND_URL already includes /api/v1
const BACKEND_URL = (
  process.env.BACKEND_URL ?? "http://localhost:5000/api/v1"
).replace(/\/+$/, "");
const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

/**
 * Typed error thrown when the backend returns { success: false, error: { code, message } }.
 *
 * Backend spec §13.3 error codes handled by consumers:
 *   INVALID_CREDENTIALS, ACCOUNT_LOCKED (includes remainingSeconds in details),
 *   ACCOUNT_INACTIVE, ACCOUNT_FROZEN, TOKEN_EXPIRED, TOKEN_INVALID,
 *   TOKEN_REUSE_DETECTED, MUST_CHANGE_PASSWORD, FORBIDDEN, USER_NOT_FOUND,
 *   ACCOUNT_NOT_FOUND, EMAIL_EXISTS, NATIONAL_ID_EXISTS, INSUFFICIENT_FUNDS,
 *   CURRENCY_MISMATCH, SAME_ACCOUNT, CANNOT_DELETE_ADMIN,
 *   INVALID_CURRENT_PASSWORD, INTERNAL_ERROR, VALIDATION_ERROR
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
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
 * - Automatically attaches the Bearer access token from the NextAuth session.
 * - Forwards the Cookie header so the backend refreshToken HttpOnly cookie is sent.
 * - Unwraps the { success, data } / { success, error } envelope (spec §8).
 * - On 401 TOKEN_EXPIRED: silently calls POST /auth/refresh then retries once.
 * - If refresh fails, throws the TOKEN_EXPIRED ApiError so the app can redirect to login.
 * - Throws ApiError on any { success: false } with the backend's code and message.
 * - Returns both `data` and optional `pagination` (spec §8, success with pagination).
 */
export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<{ data: T; pagination?: BackendSuccessEnvelope<T>["pagination"] }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!skipAuth) {
    try {
      const token = await getMyToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // If token retrieval fails, proceed without auth — backend returns 401.
    }
  }

  const res = await fetch(`${BACKEND_URL}${normalizePath(path)}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const body: BackendEnvelope<T> = await res.json();

  // ── Transparent Token Refresh (spec §7.3) ────────────────────────────────
  // When the backend returns 401 TOKEN_EXPIRED, silently rotate the access
  // token via POST /auth/refresh and retry the original request once.
  if (
    !skipAuth &&
    res.status === 401 &&
    "success" in body &&
    !body.success &&
    (body as BackendErrorEnvelope).error?.code === "TOKEN_EXPIRED"
  ) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      const retryRes = await fetch(`${BACKEND_URL}${normalizePath(path)}`, {
        ...options,
        credentials: "include",
        headers,
      });
      const retryBody: BackendEnvelope<T> = await retryRes.json();

      if ("success" in retryBody && !retryBody.success) {
        const err = retryBody as BackendErrorEnvelope;
        throw new ApiError(
          err.error.code,
          err.error.message,
          retryRes.status,
          err.error.details
        );
      }

      const successRetry = retryBody as BackendSuccessEnvelope<T>;
      return { data: successRetry.data, pagination: successRetry.pagination };
    }

    // Refresh failed (expired / revoked / reuse detected) — surface error to caller.
    const errBody = body as BackendErrorEnvelope;
    throw new ApiError(
      errBody.error.code,
      errBody.error.message,
      res.status,
      errBody.error.details
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  if ("success" in body && !body.success) {
    const errBody = body as BackendErrorEnvelope;
    throw new ApiError(
      errBody.error.code,
      errBody.error.message,
      res.status,
      errBody.error.details
    );
  }

  const successBody = body as BackendSuccessEnvelope<T>;
  return { data: successBody.data, pagination: successBody.pagination };
}

/**
 * Converts an ApiError into a standardised Next.js Route Handler JSON response body.
 * Preserves the same { success, error } shape the backend uses (spec §13.1).
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
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
  };
}
