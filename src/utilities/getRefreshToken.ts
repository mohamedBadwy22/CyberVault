'use server';

import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:5000';

/**
 * Calls POST /api/v1/auth/refresh on the backend.
 *
 * The backend's refreshToken is stored in an HttpOnly cookie named `refreshToken`
 * (set by the backend's Set-Cookie header). Next.js forwards all cookies to
 * outgoing fetch calls when `credentials: 'include'` is used, so the browser
 * automatically sends the refreshToken cookie without any manual extraction.
 *
 * Returns the new raw access token string on success, or null on failure
 * (expired/revoked/reuse-detected).
 */
export default async function refreshAccessToken(
  providedRefreshToken?: string
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    let refreshToken = providedRefreshToken;

    if (!refreshToken) {
      const { decode } = await import("next-auth/jwt");
      const cookieStore = await cookies();
      const encodedToken = cookieStore.get("next-auth.session-token")?.value;
      if (encodedToken) {
        const decodedToken = await decode({
          secret: process.env.NEXTAUTH_SECRET!,
          token: encodedToken,
        });
        refreshToken = (decodedToken as any)?.refreshToken;
      }
    }

    if (!refreshToken) return null;

    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) return null;

    const body = await res.json();
    if (!body.success) return null;

    let newRefreshToken: string | undefined;
    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
      const match = setCookieHeader.match(/refreshToken=([^;]+)/);
      if (match) newRefreshToken = match[1];
    }

    return {
      accessToken: (body.data as { accessToken: string }).accessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    return null;
  }
}