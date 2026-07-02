import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route accessibility by role.
// Per the backend spec §7.6, all authenticated roles can access their own profile.
// The backend is the authoritative access control layer; this middleware is a UX guard only.
const accessibility: Record<string, string[]> = {
  '/home': ['user', 'employee', 'admin'],
  '/home/profile': ['user'],
  '/home/transactions': ['user', 'employee', 'admin'],
  '/home/manage-user': ['employee', 'admin'],
  '/home/register-user': ['employee', 'admin'],
  '/home/manage-employee': ['admin'],
  '/home/register-employee': ['admin'],
  '/home/dashboard': ['admin'],
  '/change-password': ['user', 'employee', 'admin'],
};

// The only route accessible when mustChangePassword === true.
const CHANGE_PASSWORD_PATH = '/change-password';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const encodedToken = await getToken({ req: request });

  if (encodedToken) {
    // mustChangePassword guard — block all routes except the change-password page.
    const mustChangePassword = encodedToken?.mustChangePassword as boolean | undefined;
    if (mustChangePassword === true && pathname !== CHANGE_PASSWORD_PATH) {
      return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
    }

    // SPEC-005: /change-password is reserved for forced first-login users.
    // Everyone else changes their password inline on the profile page.
    if (pathname === CHANGE_PASSWORD_PATH && mustChangePassword !== true) {
      return NextResponse.redirect(new URL('/home/profile', request.url));
    }

    // Role-based access control for /home and /change-password routes
    if (pathname.startsWith('/home') || pathname === '/change-password') {
      const userRole = encodedToken?.user?.role as string | undefined;
      const allowedRoles = accessibility[pathname];

      if (!allowedRoles || !allowedRoles.includes(userRole!)) {
        return NextResponse.redirect(new URL('/not-found', request.url));
      }
    }
    
    // If authenticated user goes to login, redirect them to home
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    return NextResponse.next();
  } else {
    // Unauthenticated users
    const isProtected = pathname.startsWith('/home') || pathname === '/change-password';
    if (isProtected) {
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
