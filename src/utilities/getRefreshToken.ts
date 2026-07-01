'use server';

import { cookies } from 'next/headers';

// Backend spec §4: BACKEND_URL already includes /api/v1
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:5000/api/v1').replace(/\/+$/, '');

// Single-flight lock. Concurrent callers sharing the SAME refresh token reuse one
// in-flight /auth/refresh instead of each firing their own. The backend rotates
// (revokes the old, issues a new) refresh token on every refresh, so two parallel
// refreshes race: the second presents the just-revoked token -> TOKEN_REUSE_DETECTED
// -> the whole family is burned and the user sees a spurious "token expired".
//
// Keyed by the refreshToken cookie VALUE (not global): same-user parallel requests
// collide on the same key and share; different users have different cookies and
// refresh independently, so no user ever receives another user's token.
//
// ponytail: in-process lock only. On a multi-instance serverless deploy two
// requests can land on different instances and still race; the ceiling there is a
// backend grace window that tolerates the immediately-prior refresh token.
const inFlight = new Map<string, Promise<string | null>>();

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
  const cookieStore = await cookies();
  const key = cookieStore.get('refreshToken')?.value ?? '';

  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = doRefresh(cookieStore);
  inFlight.set(key, p);
  try {
    return await p;
  } finally {
    inFlight.delete(key);
  }
}

async function doRefresh(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<string | null> {
  try {
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
