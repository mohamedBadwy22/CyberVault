import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route accessibility by role.
// Per the backend spec §7.6, all authenticated roles can access their own profile.
// The backend is the authoritative access control layer; this middleware is a UX guard only.
const accessibility: Record<string, string[]> = {
  '/home': ['user', 'employee', 'admin'],
  '/home/profile': ['user', 'employee', 'admin'],   // all roles own a profile
  '/home/transactions': ['user', 'employee', 'admin'],
  '/home/manage-user': ['employee', 'admin'],
  '/home/register-user': ['employee', 'admin'],
  '/home/manage-employee': ['admin'],
  '/home/register-employee': ['admin'],
  '/home/dashboard': ['admin'],
};

// The only route accessible when mustChangePassword === true.
const CHANGE_PASSWORD_PATH = '/home/profile';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const encodedToken = await getToken({ req: request });

  if (encodedToken) {
    // mustChangePassword guard — block all routes except the profile/change-password page.
    const mustChangePassword = encodedToken?.mustChangePassword as boolean | undefined;
    if (mustChangePassword === true && pathname !== CHANGE_PASSWORD_PATH) {
      return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
    }

    const userRole = encodedToken?.user?.role as string | undefined;
    const allowedRoles = accessibility[pathname];

    if (!allowedRoles || !allowedRoles.includes(userRole!)) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    return NextResponse.next();
  } else if (pathname === '/login') {
    return NextResponse.next();
  } else {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }
}

export const config = {
  matcher: [
    '/login',
    '/home',
    '/home/profile',
    '/home/transactions',
    '/home/manage-user',
    '/home/register-user',
    '/home/manage-employee',
    '/home/register-employee',
    '/home/dashboard',
  ],
}
