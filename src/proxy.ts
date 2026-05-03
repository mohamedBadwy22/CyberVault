import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const encodedToken  = await getToken({ req: request });
    const accessibility = {
        '/home': ['user', 'employee', 'admin'],
        '/home/profile': ['user'],
        '/home/transactions': ['user', 'employee', 'admin'],
        '/home/manage-user': ['employee', 'admin'],
        '/home/register-user':['employee', 'admin'],
        '/home/manage-employee': ['admin'],
        '/home/register-employee': ['admin'],
        '/home/dashboard': ['admin']
    };

    if (encodedToken) {
        const userRole   = encodedToken?.user?.role;
        const allowedRoles = accessibility[pathname as keyof typeof accessibility];
        if (!allowedRoles || !allowedRoles.includes(userRole!)) {
            return NextResponse.redirect(new URL('/not-found', request.url));
        }
        return NextResponse.next();
    } else if (pathname === '/login') {
        return NextResponse.next();
    } else {
        return NextResponse.redirect(new URL('/not-found', request.url))
    }
}
 
export const config = {
  matcher: ['/login' , '/home/manage-employee', '/home/manage-user' , '/home', '/home/profile', '/home/transactions',  '/home/register-user', '/home/register-employee', '/home/dashboard'],
}
