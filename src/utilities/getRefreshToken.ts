'use server';

import { cookies } from 'next/headers';

// Backend spec §4: BACKEND_URL already includes /api/v1
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:5000/api/v1').replace(/\/+$/, '');

/**
 * Calls POST /api/v1/auth/refresh on the CyberVault backend.
 *
 * The backend stores the refreshToken in an HttpOnly cookie named `refreshToken`
 * (set via Set-Cookie on login). We forward the full cookie header from the
 * Next.js server context so the backend receives it automatically.
 *
 * Backend spec §7.3 success response:
 *   { success: true, data: { accessToken: string } }
 *
 * Backend spec §13.3 failure codes (all return null here):
 *   TOKEN_EXPIRED, TOKEN_INVALID, TOKEN_REUSE_DETECTED
 *
 * Returns the new raw access token string on success, or null on any failure.
 */
export default async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward all cookies so the backend's HttpOnly refreshToken cookie is included.
        // This is necessary because Next.js server actions don't automatically forward
        // outbound cookies in fetch() calls.
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) return null;

    const body = await res.json();
    // Backend spec §8.1 envelope: { success, data: { accessToken } }
    if (!body.success) return null;

    const accessToken = (body.data as { accessToken: string }).accessToken;

    // Persist the ROTATED refreshToken cookie. The backend revokes the old
    // refresh token on every /auth/refresh and issues a new one via Set-Cookie
    // (spec §7.3). Without re-storing it, the next refresh reuses a revoked
    // token -> TOKEN_REUSE_DETECTED -> the whole family is revoked.
    const rotated = res.headers.getSetCookie?.() ?? [];
    for (const cookieStr of rotated) {
      const match = cookieStr.match(/^refreshToken=([^;]+)/);
      if (match) {
        try {
          cookieStore.set('refreshToken', match[1], {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days (spec §7.1)
          });
        } catch {
          // Read-only context — all callers are route handlers/server actions,
          // so this should never fire; degrade gracefully if it does.
        }
        break;
      }
    }

    // Cache the fresh access token so getMyToken() stops returning the stale one
    // and we don't refresh on every request (access-token TTL is 10 min, §7.1).
    try {
      cookieStore.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 600, // 10 minutes
      });
    } catch {
      // Read-only context — ignore.
    }

    return accessToken;
  } catch {
    return null;
  }
}
