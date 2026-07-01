'use server';

import { encode, decode, type JWT } from 'next-auth/jwt';
import { cookies } from 'next/headers';

// NextAuth session cookie: encrypted (JWE) — the ONLY place backend tokens live.
// No custom plaintext token cookies: accessToken + refreshToken ride inside this
// encrypted blob so the browser never sees a decodable JWT or the refresh token.
//
// Default session lifetime (NextAuth default is 30 days). We re-issue the cookie
// with this maxAge on every rotation, which also rolls the session on activity.
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

// NextAuth prefixes the cookie with __Secure- when it uses secure cookies.
// Match the existing convention in this codebase (secure ⇔ production).
const useSecure = process.env.NODE_ENV === 'production';

export async function sessionCookieName(): Promise<string> {
  return useSecure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';
}

/** Decode the encrypted NextAuth session JWT, or null if unauthenticated. */
export async function readSessionToken(): Promise<JWT | null> {
  const cookieStore = await cookies();
  // Try prod name first (added __Secure- on HTTPS), then dev name.
  const raw =
    cookieStore.get('__Secure-next-auth.session-token')?.value ??
    cookieStore.get('next-auth.session-token')?.value;
  if (!raw) return null;
  return decode({ secret: process.env.NEXTAUTH_SECRET!, token: raw });
}

/**
 * Re-encrypt the session JWT with updated fields and re-set the cookie.
 *
 * This is how token rotation persists without any custom cookie: the rotated
 * access + refresh tokens are written back into the same encrypted session-token
 * cookie NextAuth issued at login. Legal only in route handlers / server actions
 * (cookies().set is a no-op / throws in a read-only render context).
 *
 * ponytail: single cookie, no chunking. Encoded size (~1.5KB with both tokens)
 * is well under the 4KB limit; if the profile grows past that NextAuth would
 * chunk into .0/.1 and readSessionToken would need to reassemble.
 */
export async function writeSessionToken(token: JWT): Promise<void> {
  const encoded = await encode({
    token,
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: SESSION_MAX_AGE,
  });
  const cookieStore = await cookies();
  cookieStore.set(await sessionCookieName(), encoded, {
    httpOnly: true,
    secure: useSecure,
    sameSite: 'lax', // NextAuth default for the session cookie
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}
