import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth0 } from "./lib/auth0";

/** Middleware to protect routes that require authentication and redirect logged-in users away from auth pages. */
export async function middleware(request: NextRequest) {
    // 1. Let Auth0 middleware process the request first
    const authRes = await auth0.middleware(request);


    if (request.nextUrl.pathname.startsWith("/auth")) {
        return authRes;
    }

    // 2. Resolve final authentication unified state
    const session = await auth0.getSession(request);
    const auth0Token = session?.user;
    const customToken = request.cookies.get('session.token')?.value;

    const isAuthenticated = !!auth0Token || !!customToken;

    // Pages meant only for unauthenticated users
    const authPages = ['/login', '/register', '/forgot-password', '/verify-email'];
    const isAuthPage = authPages.some(p => request.nextUrl.pathname.startsWith(p));

    // Public paths that do not require authentication
    const publicApiPaths = ['/api/auth', '/api/logout', '/auth'];
    const isPublicPath = request.nextUrl.pathname === '/' || [...authPages, ...publicApiPaths].some(p => 
        request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`)
    );

    // Any path that isn't explicitly public is protected by default
    const isProtectedPath = !isPublicPath;

    // 👮 Protect Routes
    if (!isAuthenticated && isProtectedPath) {
        if (request.nextUrl.pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuthenticated && isAuthPage) {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // 🛡️ TRUSTED HEADER INJECTION: Sync with API Routes
    if (isAuthenticated && auth0Token) {
        // Find MongoDB ID if possible (from session or bridge? - we'll rely on withAuth for DB lookups, 
        // but passing the email/sub helps for identification consistency)
        authRes.headers.set('x-auth-user-email', auth0Token.email || '');
        authRes.headers.set('x-auth-user-id', auth0Token.sub || '');
    }

    return authRes;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
    ],
};
