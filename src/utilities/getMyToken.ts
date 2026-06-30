'use server';

import { decode } from 'next-auth/jwt';
import { cookies } from 'next/headers';

/**
 * Extracts the raw backend access token from the NextAuth session JWT.
 *
 * NextAuth stores the session in a cookie:
 *   - Development (HTTP):  next-auth.session-token
 *   - Production (HTTPS):  __Secure-next-auth.session-token
 *
 * The JWT callback in auth.ts puts the raw access token at token.token
 * (server-side only — never forwarded to the client session).
 *
 * Returns the access token string, or undefined if not authenticated.
 */
export default async function getMyToken(): Promise<string | undefined> {
  const cookieStore = await cookies();

  // Prefer the freshly-rotated access token cached by refreshAccessToken().
  // This stops getMyToken from returning the stale login token after a refresh,
  // which would otherwise force a refresh on every request.
  const cached = cookieStore.get('accessToken')?.value;
  if (cached) return cached;

  // Fallback: the access token seeded into the NextAuth session JWT at login.
  // Try production cookie name first (__Secure- prefix added on HTTPS)
  const encodedToken =
    cookieStore.get('__Secure-next-auth.session-token')?.value ??
    cookieStore.get('next-auth.session-token')?.value;

  if (!encodedToken) return undefined;

  const decodedToken = await decode({
    secret: process.env.NEXTAUTH_SECRET!,
    token: encodedToken,
  });

  if (!decodedToken) return undefined;

  return (decodedToken as { token?: string }).token;
}
