import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Unified logout handler that clears both:
 * 1. The legacy session.token (Bridge)
 * 2. The Auth0 context (by redirecting to Auth0 logout)
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get('returnTo') || '/login';

    // 1. Create a redirect response to the Auth0 logout route
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(`${baseUrl}/auth/logout?returnTo=${encodeURIComponent(returnTo)}`);

    // ONLY delete your custom cookie
    response.cookies.delete('session.token');


    return response;
}

/** Legacy POST support for existing code */
export async function POST() {
    const response = NextResponse.json({ message: 'Logout pending redirect' });
    response.cookies.delete('session.token');
    return response;
}
