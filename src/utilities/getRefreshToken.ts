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
export default async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward all cookies so the backend's HttpOnly refreshToken cookie is included.
        Cookie: cookieHeader,
      },
      credentials: 'include',
    });

    if (!res.ok) return null;

    const body = await res.json();
    if (!body.success) return null;

    return (body.data as { accessToken: string }).accessToken;
  } catch {
    return null;
  }
}