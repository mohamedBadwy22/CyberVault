'use server';

import { readSessionToken } from './sessionToken';

/**
 * Extracts the raw backend access token from the encrypted NextAuth session JWT.
 *
 * The access token lives at token.token inside the JWE session cookie (seeded at
 * login, rotated in place by refreshAccessToken -> writeSessionToken). There is
 * no plaintext accessToken cookie: the browser only ever holds the encrypted blob.
 *
 * Returns the access token string, or undefined if not authenticated.
 */
export default async function getMyToken(): Promise<string | undefined> {
  const token = await readSessionToken();
  return (token as { token?: string } | null)?.token ?? undefined;
}
