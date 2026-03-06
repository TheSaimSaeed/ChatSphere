import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Middleware to protect routes that require authentication and redirect logged-in users away from auth pages. */
export function middleware(request: NextRequest) {
    const token = request.cookies.get('session.token')?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
    const isProtectedPath = request.nextUrl.pathname.startsWith('/chat') || request.nextUrl.pathname.startsWith('/profile');

    if (!token && isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Allow API routes to handle their own auth checks using withAuth
    // But we could also centrally protect /api/ routes here if needed.
    // We'll follow the plan using withAuth in route handlers.

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/login',
        '/register',
        '/chat/:path*',
        '/profile',
    ],
};
