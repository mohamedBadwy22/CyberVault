'use server';

import { readSessionToken, writeSessionToken } from './sessionToken';

// Backend spec §4: BACKEND_URL already includes /api/v1
const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:5000/api/v1').replace(/\/+$/, '');

// Single-flight lock. Concurrent callers sharing the SAME refresh token reuse one
// in-flight /auth/refresh instead of each firing their own. The backend rotates
// (revokes the old, issues a new) refresh token on every refresh, so two parallel
// refreshes race: the second presents the just-revoked token -> TOKEN_REUSE_DETECTED
// -> the whole family is burned and the user sees a spurious "token expired".
//
// Keyed by the refresh token VALUE (not global): same-user parallel requests
// collide on the same key and share; different users have different tokens and
// refresh independently, so no user ever receives another user's token.
//
// ponytail: in-process lock only. On a multi-instance serverless deploy two
// requests can land on different instances and still race; the ceiling there is a
// backend grace window that tolerates the immediately-prior refresh token.
const inFlight = new Map<string, Promise<string | null>>();

/**
 * Calls POST /api/v1/auth/refresh on the CyberVault backend.
 *
 * The refresh token lives INSIDE the encrypted NextAuth session JWT (token.refreshToken),
 * not in a plaintext cookie. We read it from there, send it to the backend as a
 * Cookie header, then persist BOTH rotated tokens back into the session JWT via
 * writeSessionToken — keeping everything under NextAuth's encryption.
 *
 * Backend spec §7.3 success response:
 *   { success: true, data: { accessToken: string } }  (+ rotated refreshToken via Set-Cookie)
 *
 * Backend spec §13.3 failure codes (all return null here):
 *   TOKEN_EXPIRED, TOKEN_INVALID, TOKEN_REUSE_DETECTED
 *
 * Returns the new raw access token string on success, or null on any failure.
 */
export default async function refreshAccessToken(): Promise<string | null> {
  const token = await readSessionToken();
  const refreshToken = (token as { refreshToken?: string } | null)?.refreshToken;
  if (!token || !refreshToken) return null;

  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const p = doRefresh(token, refreshToken);
  inFlight.set(refreshToken, p);
  try {
    return await p;
  } finally {
    inFlight.delete(refreshToken);
  }
}

async function doRefresh(
  token: NonNullable<Awaited<ReturnType<typeof readSessionToken>>>,
  refreshToken: string
): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Backend reads the refreshToken from a cookie; hand it the value we hold
        // in the encrypted session JWT (server actions don't auto-forward cookies).
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) return null;

    const body = await res.json();
    // Backend spec §8.1 envelope: { success, data: { accessToken } }
    if (!body.success) return null;

    const accessToken = (body.data as { accessToken: string }).accessToken;

    // Read the ROTATED refresh token from Set-Cookie. The backend revokes the old
    // refresh token on every /auth/refresh and issues a new one (spec §7.3). Without
    // storing it, the next refresh reuses a revoked token -> TOKEN_REUSE_DETECTED.
    let rotatedRefresh = refreshToken;
    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const cookieStr of setCookies) {
      const match = cookieStr.match(/^refreshToken=([^;]+)/);
      if (match) {
        rotatedRefresh = match[1];
        break;
      }
    }

    // Decode the new access token to refresh the stored expiry (spec §7.1: 10 min).
    let expiresAt = Date.now() + 10 * 60 * 1000; // fallback
    try {
      const payload = JSON.parse(
        Buffer.from(accessToken.split('.')[1], 'base64').toString()
      );
      expiresAt = payload.exp * 1000;
    } catch {
      // Use fallback expiry
    }

    // Persist both rotated tokens back into the encrypted session cookie.
    await writeSessionToken({
      ...token,
      token: accessToken,
      refreshToken: rotatedRefresh,
      expiresAt,
    });

    return accessToken;
  } catch {
    return null;
  }
}
